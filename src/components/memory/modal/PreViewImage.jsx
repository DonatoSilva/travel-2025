import { useState } from 'react';

import PreViewFooter from './PreViewFooter';

const PreViewImage = ({ file, i }) => {
  const [src, setSrc] = useState(null)

  if (!file) return null;

  // odtener el nombre del archivo
  const nameFile = file.name.split('.')[0];
  const reader = new FileReader();
  reader.onloadend = () => { setSrc(reader.result); };
  reader.readAsDataURL(file);

  return (
    <div className="img-container">
      <img className='img-PreView' data-name={nameFile} src={src} alt={`image-slide-${i} - ${nameFile}`} key={i} />
      <PreViewFooter />
    </div>
  )
};

export default PreViewImage;