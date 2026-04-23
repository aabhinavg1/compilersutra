import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './Question.module.css';

export const Question = ({ question, options, answer, code }) => {
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSelect = (option) => {
    setSelected(option);
    setShowAnswer(true);
  };

  return (
    <div className="mcq-panel">
      <div className="mcq-bubble mcq-question-bubble">
        <h3 className="question-title">{question}</h3>
        {code && (
          <SyntaxHighlighter language="cpp" style={vscDarkPlus} className="mcq-code-block">
            {code}
          </SyntaxHighlighter>
        )}
        <div className="mcq-options">
          {options.map((option, index) => (
            <div
              key={index}
              className={`mcq-option 
                ${selected === option ? 'selected' : ''} 
                ${showAnswer && option === answer ? 'correct' : ''} 
                ${showAnswer && selected === option && selected !== answer ? 'incorrect' : ''}`}
              onClick={() => handleSelect(option)}
              tabIndex="0"
            >
              {index + 1}) {option}
            </div>
          ))}
        </div>
      </div>

      {showAnswer && (
        <div className="mcq-bubble mcq-answer-bubble show">
          <div className="mcq-speaker-header">
            <div className="mcq-avatar"></div>
            <h4>Answer</h4>
          </div>
          <p>
            <strong>Your selected answer:</strong> {selected || 'None'}<br />
            {selected === answer ? (
              <strong className="correct-answer">Correct!</strong>
            ) : (
              <>
                <strong className="incorrect-answer">Incorrect!</strong><br />
                The correct answer is: <strong>{answer}</strong>.
              </>
            )}
          </p>
        </div>
      )}

      <div className="mcq-divider"></div>
    </div>
  );
};
