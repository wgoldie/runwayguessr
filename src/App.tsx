import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import "./App.css";
import imagePagesLocal from './image_links.json'

const IGNORE_REGEX = /(Runway Details)|(Backstage)/
const CAPSULE_REGEX = /(Bridal)|(Resort)|(Cruise)/
const MAX_COUNT = 10;

type Config = {
  minYear: number,
  maxYear: number,
  includeMen: boolean,
  includeWomen: boolean,
  includeCapsule: boolean
}

const Config = (props: { setConfig: (c: Config) => void, config: Config, minPossibleYear: number, maxPossibleYear: number, onSave: () => void }) => {
  const { config, setConfig, minPossibleYear, maxPossibleYear } = props;

  const yearList = useMemo(() => {
    if (minPossibleYear > maxPossibleYear) { console.error('invalid years'); return [minPossibleYear]; }
    const list = [];
    for (let i = minPossibleYear; i <= maxPossibleYear; i++) {
      list.push(i)
    }
    return list;
  }, [minPossibleYear, maxPossibleYear]);

  const handleChangeMen = useCallback((e) => setConfig({ ...config, includeMen: e.target.checked }));
  const handleChangeWomen = useCallback((e) => setConfig({ ...config, includeWomen: e.target.checked }));
  const handleChangeCapsule = useCallback((e) => setConfig({ ...config, includeCapsule: e.target.checked }));
  const handleChangeMinYear = useCallback((e) => setConfig({ ...config, minYear: parseInt(e.target.value, 10) }));
  const handleChangeMaxYear = useCallback((e) => setConfig({ ...config, maxYear: parseInt(e.target.value, 10) }));

  return (
    <div className="config">
      <h3>Rules</h3>
      <label>
        <input type="checkbox" checked={config.includeMen} onChange={handleChangeMen} />
        Include Menswear?
      </label>
      <label>
        <input type="checkbox" checked={config.includeWomen} onChange={handleChangeWomen} />
        Include Womenswear?
      </label>
      <label>
        <input type="checkbox" checked={config.includeCapsule} onChange={handleChangeCapsule} />
        Include Resort/Cruise/Capsule Collections?
      </label>
      <div className="years">
        <div className="year">
          <label htmlFor="minYear">Min Year:</label>
          <select id="minYear" value={`${config.minYear}`} onChange={handleChangeMinYear}>
           {yearList.map(year => <option key={year} value={`${year}`}>{year}</option>)}
          </select>
        </div>
        <div className="year">
          <label htmlFor="maxYear">Max Year:</label>
          <select id="maxYear" value={`${config.maxYear}`} onChange={handleChangeMaxYear}>
           {yearList.map(year => <option key={year} value={`${year}`}>{year}</option>)}
          </select>
        </div>
      </div>
      <button onClick={props.onSave} disabled={!(config.includeMen || config.includeWomen)} className="save-config">Play</button>
    </div>
  );
}

const MIN_YEAR = 2000
const MAX_YEAR = (new Date()).getFullYear()


function App() {
  const [imagePages, setImagePages] = useState(imagePagesLocal);
  const [config, setConfig] = useState({ minYear: MIN_YEAR, maxYear: MAX_YEAR, includeMen: true, includeWomen: true, includeCapsule: false });
  const [configHidden, setConfigHidden] = useState(false);
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
    if (!configHidden)  { return null; }
    const flat = [];
    for (const designer of Object.values(imagePages)) {
      for (const collection of Object.values(designer)) {
        if (collection.ignoredCollection) { continue; }
        if (!config.includeMen && collection.gender == 'Men') { continue; }
        if (!config.includeWomen && collection.gender == 'Women') { continue; }
        if (!config.includeCapsule && collection.collectionType.match(CAPSULE_REGEX)) { continue; }
        if (config.minYear > collection.year) { continue; }
        if (config.maxYear < collection.year) { continue; }
        for (const image of collection.images) {
          flat.push(image);
        }
      }
    }
       
    for (let i = flat.length -1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    return flat;

  }, [imagePages, configHidden, config]);

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

  const handleSave = useCallback(() => setConfigHidden(true), [setConfigHidden]);

  let main;
  if (!imagePagesFlat) {
    main ='Loading...';
  } else if (imagePagesFlat.length == 0) {
    main = 'No images found that match your rules (collection type, year, etc). Reload and try with new rules.'
  } else {

    main = <iframe ref={ref} height="100%" width="100%" src={`https://firstview.com/collection_image_closeup.php?${imagePagesFlat[index]}`} frameBorder="0"></iframe>;
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
    {main}
        {index == 0 && !configHidden ? <Config setConfig={setConfig} config={config} minPossibleYear={MIN_YEAR} maxPossibleYear={MAX_YEAR} onSave={handleSave} /> : null}
      <div className="bottom-cover">
    {count < MAX_COUNT ? (
      <div className="controls">
        { revealed ? <button onClick={handleYes} disabled={!revealed}  className="yes">Yes<div className='hint'>(y)</div></button> : null }
      { configHidden ? <button onClick={handleReveal} disabled={revealed} className="reveal">Reveal<div className='hint'>(space)</div></button> : null }
    { revealed ? <button onClick={handleNo} disabled={!revealed} className="no">No<div className='hint'>(n)</div></button> : null}
      </div>)
      : (<div className='controls'><button onClick={handleAgain} className="play-again">Play Again<div className='hint'>(enter)</div></button></div>)}
    </div>
    </div>
  );
}

export default App;
