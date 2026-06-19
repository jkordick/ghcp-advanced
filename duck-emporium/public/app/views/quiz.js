import { get, post } from "../api.js";

function escape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderForm(mount, questions, onSubmit) {
  mount.innerHTML = `
    <section>
      <div class="hero">
        <h1>Find your duck.</h1>
        <p>Answer a few quick questions and we'll recommend the duck most likely to listen patiently while you rubber-duck through your next bug.</p>
      </div>
      <form class="quiz-form" id="quiz-form">
        ${questions
          .map(
            (q) => `
          <fieldset data-qid="${escape(q.id)}">
            <legend>${escape(q.prompt)}</legend>
            ${q.answers
              .map(
                (a, i) => `
              <label>
                <input type="radio" name="${escape(q.id)}" value="${escape(
                  a.id
                )}" ${i === 0 ? "required" : ""} />
                <span>${escape(a.label)}</span>
              </label>`
              )
              .join("")}
          </fieldset>`
          )
          .join("")}
        <div class="actions">
          <button type="submit" id="quiz-submit">Find my duck</button>
          <span id="quiz-status" class="status" role="status"></span>
        </div>
      </form>
    </section>
  `;
  const form = mount.querySelector("#quiz-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const answers = {};
    for (const [k, v] of data.entries()) answers[k] = String(v);
    onSubmit(answers);
  });
}

function renderResult(mount, result, retry) {
  const d = result.duck;
  mount.innerHTML = `
    <section class="quiz-result">
      <h2>Your duck is…</h2>
      <span class="category">${escape(d.category)}</span>
      <h3>${escape(d.name)}</h3>
      <p>${escape(result.message)}</p>
      <div class="actions">
        <a class="button" href="${escape(result.detailUrl)}">See its details</a>
        <button type="button" class="secondary" id="retry">Try again</button>
      </div>
    </section>
  `;
  mount.querySelector("#retry").addEventListener("click", retry);
}

export async function quizView(mount) {
  const res = await get("/api/quiz");
  if (!res.ok || !res.body || !Array.isArray(res.body.questions)) {
    mount.innerHTML = `<div class="error">Could not load the quiz.</div>`;
    return;
  }
  const questions = res.body.questions;

  const run = () => {
    renderForm(mount, questions, async (answers) => {
      const status = mount.querySelector("#quiz-status");
      const submit = mount.querySelector("#quiz-submit");
      submit.disabled = true;
      status.textContent = "Thinking…";
      const result = await post("/api/quiz", { answers });
      submit.disabled = false;
      status.textContent = "";
      if (!result.ok || !result.body || result.body.error) {
        const msg =
          (result.body &&
            result.body.error &&
            result.body.error.message) ||
          "Could not score your quiz.";
        status.textContent = msg;
        return;
      }
      renderResult(mount, result.body, run);
    });
  };
  run();
}
