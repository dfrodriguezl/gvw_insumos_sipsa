import React, { useState }  from 'react';
import { variables } from '../base/variables';
import { createBasemapSource } from '../util/basemapSource';
import Gris from '../../img/gris.png';
import Noche from '../../img/noche.png';
import OSM from '../../img/OSM.png';
import Satelital from '../../img/satelital.png';

const BaseMap = () => {

  const [ checked, setChecked ] = useState(variables.baseMapCheck);

  function handleClick(e) {
    if (!variables.base || e === variables.baseMapCheck) return;
    variables.baseMapCheck = e;
    variables.base.setSource(createBasemapSource(e));
    setChecked(e);
  }

  variables.changeBaseMap = () => {
    let bm = variables.baseMapCheck;
    setChecked(bm);
  }
  
  
  return (
    <div className="tools__panel">
      <h3 className="tools__title"> Mapa Base </h3>
      <p className="tools__text">Seleccione el tipo de mapa base que desea visualizar</p>
      <ul className="basemap__list">
        {
          Object.keys(variables.baseMaps).map((values, index)=> {
            // console.log(values, index);
            return <li  key={'cajaBaseMap' + `${index+1}`} className="basemap__list__item" onClick={() => handleClick(values)}>
                    <input type="radio" id={'switch' + `${index+1}`} name='radioBaseMap' value={values} checked={values === checked} onChange={() => handleClick(values)}/>
                    <label htmlFor={'switch' + `${index+1}`}>
                      <div key={'cajaBaseMap' + `${index+1}`} className="basemap__btn">
                        {values === 'Gris'?
                          <img src={Gris} className="basemap__img" alt="" />:
                          values === 'Noche'?
                          <img src={Noche} className="basemap__img" alt="" />:
                          values === 'OSM'?
                          <img src={OSM} className="basemap__img" alt="" />:
                          values === 'Satelital'?
                          <img src={Satelital} className="basemap__img" alt="" />:
                          null
                        }
                        
                        <p className="basemap__name">{values}</p>
                      </div>
                    </label>
                  </li>
          })
        }
      </ul>
    </div>
  );
}
export default BaseMap;