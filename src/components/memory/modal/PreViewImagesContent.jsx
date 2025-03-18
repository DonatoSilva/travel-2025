import { useStore } from '@nanostores/react';
import { addImgStore } from 'src/store/memory/addStore';
import SolarInfoSquareBold from '@components/icons/SolarInfoSquareBold.jsx'

// import Swiper core and required modules
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/// mis componentes
import PreViewImage from './PreViewImage';

export const PreViewImagesContent = () => {
  const addImgs = useStore(addImgStore);

  return (
    <>
      <style>
        {`
          .preViewSwiperContent {
            position: relative;
            width: 100%;
            max-height: 500px;

            .swiper {
              width: 100%;
              height: 450px;
              background: #fff;
              border-radius: 10px;

              .swiper-slide {
                width: 100%;
                height: auto; /* Toma toda la altura del contenedor padre */
                padding: 20px 10px;
                display: flex;
                align-items: center;
                justify-content: center;

                .image-container {
                  width: 100%;
                  max-width: 100%;
                  max-height: 100%; 
                  display: flex;
                  position: relative;
                  border-radius: 8px;
                  overflow: hidden;
                  box-sizing: border-box;
                  align-items: center;
                  justify-content: center;
                  user-select: none;
                  ovwerflow: hidden;
                }
              }
              
              .swiper-button-prev, .swiper-button-next {
                color: #1c1c1c;
              }
            }

            .spanText {
              display: flex;
              flex-direction: row;
              gap: 5px;
              align-items: center;
              justify-content: center;
              user-select: none;
              cursor: none;
              font-size: 14px;
              position: absolute;
              top: 15px;
              left: 15px;
              z-index: 10;
              color: #fff;
              padding: 5px 8px;
              border-radius: 5px;
              background: #1c1c1c;
              opacity: 0.8;
            }
          }

          .swiper-pagination {
            color: #000;
          }
          .img-PreView {
            margin: 10px auto;
            border-radius: 8px;
            max-width: 100%;
            max-height: 400px;
            object-fit: contain; /* Evita deformaciones */ 
          }
          .swiper-pagination-fraction {
            color: #ccccc;
            font-weight: normal;
          }
        `}
      </style>
      <div className='preViewSwiperContent'>
        <Swiper
          className='swiper'
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          pagination={{ type: "fraction" }}
        >
          {Object.entries(addImgs).map(([key, file], index) => {
            return (
              <SwiperSlide key={key}>
                <PreViewImage file={file} i={index} />
              </SwiperSlide>)
          })}
        </Swiper>
        <span className='spanText'><SolarInfoSquareBold /><strong>Visualización previa</ strong></span>
      </div>
    </>
  );
};
