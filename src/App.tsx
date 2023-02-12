import React, { useCallback, useState } from 'react';
import "./App.css";
import imagePages from './image_links.json'

const imagePagesFlat = Object.values(imagePages).flatMap(f => Object.values(f).flatMap(x => x.images))

for (let i = imagePagesFlat.length -1; i > 0; i--) {
  let j = Math.floor(Math.random() * (i + 1));
  [imagePagesFlat[i], imagePagesFlat[j]] = [imagePagesFlat[j], imagePagesFlat[i]];
}
console.log(imagePages, imagePagesFlat)

function App() {
  const ref = React.useRef();

  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [index, setIndex] = useState(0);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, [setRevealed]);
  const handleYes = useCallback(() => {
    setRevealed(false);
    setScore(score+1);
    setIndex(index+1);
  }, [score, setScore, index, setIndex]);
  const handleNo = useCallback(() => {
    setRevealed(false);
    setScore(score-1);
    setIndex(index+1);
  }, [score, setScore, index, setIndex]);

  return (
    <div className="reference-frame">
    <div className={`top-cover ${revealed ? 'top-cover--revealed' : ''}`} >
        <h1 className={`score ${score > 0 ? 'score--good' : ''} ${score < 0 ? 'score--bad' : ''}`}>
          Score: {score}
        </h1>
    </div>
      <iframe ref={ref} height="100%" width="100%" src={imagePagesFlat[index]} frameborder="0"></iframe>
      <div className="bottom-cover">
        <div className="controls">
    { revealed ? <button onClick={handleYes} disabled={!revealed}  className="yes">Yes</button> : null }
            <button onClick={handleReveal} disabled={revealed} className="reveal">Reveal</button>
    { revealed ? <button onClick={handleNo} disabled={!revealed} className="no">No</button> : null}
        </div>
      </div>
    </div>
  );
}

export default App;
