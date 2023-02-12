import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import "./App.css";
import imagePagesLocal from './image_links.json'

const IGNORE_REGEX = /(Runway Details)|(Backstage)/
const MAX_COUNT = 10;

function App() {
  const [imagePages, setImagePages] = useState(imagePagesLocal);
  /*
  useEffect(() => {
    fetch('https://d2r56ry5w7mshh.cloudfront.net/image_links.json').then(response => {
      if (!response.ok) { return; }
      return response.json();
    }).then(data => setImagePages(data))
  }, [setImagePages])
  */
  const ref = React.useRef();

  const imagePagesFlat = useMemo(() => {
    if(!imagePages) { return null; }
    const flat = Object.values(imagePages).flatMap(f => Object.values(f).flatMap(x => x.collection.match(IGNORE_REGEX) ? [] : x.images))

    for (let i = flat.length -1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    return flat;

  }, [imagePages]);

  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  const stillPlaying  = count < MAX_COUNT;
  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, [setRevealed]);
  const handleYes = useCallback(() => {
    if (!stillPlaying) { return; }
    if (!revealed) { return; }
    setRevealed(false);
    setCount(count+1);
    setScore(score+1);
    setIndex(index+1);
  }, [score, setScore, index, setIndex, stillPlaying, revealed]);
  const handleNo = useCallback(() => {
    if (!stillPlaying) { return; }
    if (!revealed) { return; }
    setCount(count+1);
    setRevealed(false);
    setIndex(index+1);
  }, [score, setScore, index, setIndex, stillPlaying, revealed]);
  const handleAgain = useCallback(() => {
    if (stillPlaying) { return; }
    setRevealed(false);
    setIndex(index+1);
    setCount(0);
    setScore(0);
  }, [score, setScore, index, setIndex, setRevealed, stillPlaying, revealed]);

  const handler = useRef();

  const handleKey = useCallback((e) => {
    if (e.code == 'Space') { handleReveal(); }
    if (e.code == 'KeyY') { handleYes(); }
    if (e.code == 'KeyN') { handleNo(); }
    if (e.code == 'Enter') { handleAgain(); }
  }, [handleReveal, handleYes, handleNo, handleAgain]);

  useEffect(() => {
    if (handler.current) {
      window.removeEventListener('keydown', handler.current);
    }
    handler.current = handleKey;
    window.addEventListener('keydown', handleKey);
    return () => { if(handler.current) { window.removeEventListener('keydown', handler.current) } };
  }, [handleKey]);

  if (!imagePagesFlat) { 
    return <div>Loading...</div>
  }

  return (
    <div className="reference-frame">
    <div className={`top-cover ${revealed ? 'top-cover--revealed' : ''}`} >
    <div className="top-content">
        <h1 className="logo">RunwayGuessr</h1>
    <div className='score-area'>
    {stillPlaying ? (
        <h2>
          Round {count+1}/{MAX_COUNT}
        </h2>
    ): <h2>Game Over</h2>}
        <h2 className={`score ${score > (count * 2 / 3) ? 'score--good' : ''} ${score < count / 3 ? 'score--bad' : ''}`}>
          Score: {score}
        </h2>
    </div>
    </div>
    </div>
      <iframe ref={ref} height="100%" width="100%" src={`https://firstview.com/collection_image_closeup.php?${imagePagesFlat[index]}`} frameBorder="0"></iframe>
      <div className="bottom-cover">
    {count < MAX_COUNT ? (
      <div className="controls">
        { revealed ? <button onClick={handleYes} disabled={!revealed}  className="yes">Yes<div className='hint'>(y)</div></button> : null }
            <button onClick={handleReveal} disabled={revealed} className="reveal">Reveal<div className='hint'>(space)</div></button>
    { revealed ? <button onClick={handleNo} disabled={!revealed} className="no">No<div className='hint'>(n)</div></button> : null}
      </div>)
      : (<div className='controls'><button onClick={handleAgain} className="play-again">Play Again<div className='hint'>(enter)</div></button></div>)}
    </div>
    </div>
  );
}

export default App;
