import React, { useState } from 'react';
import { MODULE_CHECKS } from '@site/src/data/basicTerminology/curriculumMeta';
import styles from './basicTerminology.module.css';

export default function ModuleCheck({ moduleId }) {
  const questions = MODULE_CHECKS[moduleId] || [];
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  if (!questions.length) return null;

  return (
    <div className={styles.moduleCheck}>
      <h4 className={styles.moduleCheckTitle}>Knowledge check</h4>
      <p className={styles.moduleCheckHint}>
        Self-check only — answers stay on this device. No fake scores or server grading.
      </p>
      <ol className={styles.checkList}>
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const show = revealed[qi];
          return (
            <li key={qi} className={styles.checkItem}>
              <p className={styles.checkPrompt}>{q.prompt}</p>
              <div className={styles.checkChoices} role="group" aria-label={`Question ${qi + 1}`}>
                {q.choices.map((choice, ci) => {
                  const id = `${moduleId}-q${qi}-c${ci}`;
                  const isCorrect = ci === q.answerIndex;
                  let choiceClass = styles.checkChoice;
                  if (show && isCorrect) choiceClass += ` ${styles.checkChoiceCorrect}`;
                  if (show && selected === ci && !isCorrect) {
                    choiceClass += ` ${styles.checkChoiceWrong}`;
                  }
                  return (
                    <label key={id} className={choiceClass} htmlFor={id}>
                      <input
                        id={id}
                        type="radio"
                        name={`${moduleId}-q${qi}`}
                        checked={selected === ci}
                        onChange={() => {
                          setAnswers((prev) => ({ ...prev, [qi]: ci }));
                          setRevealed((prev) => ({ ...prev, [qi]: false }));
                        }}
                      />
                      <span>{choice}</span>
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                className={styles.checkBtn}
                disabled={selected === undefined}
                onClick={() => setRevealed((prev) => ({ ...prev, [qi]: true }))}
              >
                Check answer
              </button>
              {show ? <p className={styles.checkExplain}>{q.explain}</p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
