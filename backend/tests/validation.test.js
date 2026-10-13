// Run with: npm test   (no database needed)
import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { registerBody, loginBody } from "../validators/authValidator.js";
import { profileBody, companyRequestBody, directoryQuery } from "../validators/userValidator.js";
import { createJobBody } from "../validators/jobValidator.js";
import { sendMessageBody } from "../validators/messageValidator.js";
import { idParams, statusQuery } from "../validators/common.js";
import { validate } from "../middleware/validate.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const ok = (schema, data) => schema.safeParse(data).success;
const msg = (schema, data) => schema.safeParse(data).error?.issues[0]?.message;
const goodUser = { name: "Asha Patel", email: "ASHA@Mail.com ", password: "secret123", role: "student", graduationYear: "2026" };

test("register: accepts a valid payload and normalises it", () => {
  const r = registerBody.parse(goodUser);
  assert.equal(r.email, "asha@mail.com");
  assert.equal(r.graduationYear, 2026);
});
test("register: rejects bad input", () => {
  assert.match(msg(registerBody, { ...goodUser, name: "A" }), /at least 2/);
  assert.match(msg(registerBody, { ...goodUser, name: "R2D2!!" }), /only contain letters/);
  assert.match(msg(registerBody, { ...goodUser, email: "nope" }), /valid email/);
  assert.match(msg(registerBody, { ...goodUser, password: "short1" }), /at least 8/);
  assert.match(msg(registerBody, { ...goodUser, password: "onlyletters" }), /number/);
  assert.match(msg(registerBody, { ...goodUser, password: "12345678" }), /letter/);
  assert.match(msg(registerBody, { ...goodUser, role: "admin" }), /student or alumni/);
  assert.match(msg(registerBody, { ...goodUser, graduationYear: "1800" }), /1950 or later/);
  assert.match(msg(registerBody, { ...goodUser, graduationYear: "abc" }), /number/);
});
test("NoSQL-injection style objects are rejected", () => {
  assert.equal(ok(loginBody, { email: { $gt: "" }, password: "x" }), false);
  assert.equal(ok(loginBody, { email: "a@b.co", password: { $ne: null } }), false);
  assert.equal(ok(directoryQuery, { search: { $ne: "" } }), false);
});
test("profile: links, years, lists", () => {
  assert.equal(ok(profileBody, { linkedin: "https://www.linkedin.com/in/asha" }), true);
  assert.equal(ok(profileBody, { linkedin: "https://evil.com/in/asha" }), false);
  assert.equal(ok(profileBody, { linkedin: "javascript:alert(1)" }), false);
  assert.equal(ok(profileBody, { linkedin: "" }), true);
  assert.equal(ok(profileBody, { bio: "x".repeat(1501) }), false);
  const p = profileBody.parse({ skills: "React, ,Node, React", internships: [{ company: "", role: "" }, { company: "Acme", role: "Intern" }] });
  assert.deepEqual(p.skills, ["React", "Node"]);
  assert.equal(p.internships.length, 1); // blank row dropped
  assert.match(msg(profileBody, { internships: [{ company: "Acme" }] }), /Role is required/);
  assert.match(msg(profileBody, { achievements: [{ title: "Win", year: "24" }] }), /4-digit/);
});
test("company request", () => {
  assert.equal(ok(companyRequestBody, { companyName: "Acme", jobTitle: "Intern", proof: "https://x.com/offer" }), true);
  assert.equal(ok(companyRequestBody, { companyName: "A", jobTitle: "Intern" }), false);
  assert.equal(ok(companyRequestBody, { companyName: "Acme", jobTitle: "Intern", proof: "ftp://x" }), false);
});
test("job post", () => {
  const job = { title: "Frontend Intern", company: "Acme", description: "Work with React on real customer dashboards.", type: "Internship" };
  assert.equal(ok(createJobBody, job), true);
  assert.match(msg(createJobBody, { ...job, description: "too short" }), /at least 20/);
  assert.match(msg(createJobBody, { ...job, type: "Freelance" }), /Job type/);
  assert.match(msg(createJobBody, { ...job, applyLink: "not a url" }), /valid link/);
  assert.equal(createJobBody.parse({ ...job, type: undefined }).type, "Full-time");
});
test("messages, ids, filters", () => {
  assert.equal(ok(sendMessageBody, { text: "   " }), false);
  assert.equal(ok(sendMessageBody, { text: "x".repeat(1001) }), false);
  assert.equal(ok(sendMessageBody, { text: "hi" }), true);
  assert.equal(ok(idParams, { id: "64b7f0c2a1b2c3d4e5f60718" }), true);
  assert.equal(ok(idParams, { id: "123" }), false);
  assert.equal(ok(statusQuery, { status: "" }), true);
  assert.equal(ok(statusQuery, { status: "banned" }), false);
});

test("HTTP: middleware answers 400 with field errors and never reaches the controller", async () => {
  const app = express();
  app.use(express.json({ limit: "1kb" }));
  let reached = false;
  app.post("/register", validate({ body: registerBody }), (req, res) => { reached = true; res.json(req.body); });
  app.use(errorHandler);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, raw) => fetch(`${base}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: raw ?? JSON.stringify(body) });
  try {
    let res = await post({ name: "A", email: "bad", password: "x", role: "x" });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.ok(json.errors.length >= 4);
    assert.ok(json.errors.some((e) => e.field === "email"));
    assert.equal(reached, false);

    res = await post(null, "{not json");
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /invalid JSON/);

    res = await post({ name: "x".repeat(3000) });
    assert.equal(res.status, 413);

    res = await post({ ...goodUser, extra: "ignored", isAdmin: true });
    assert.equal(res.status, 200);
    const clean = await res.json();
    assert.equal(clean.isAdmin, undefined); // unknown keys are stripped
  } finally { server.close(); }
});
