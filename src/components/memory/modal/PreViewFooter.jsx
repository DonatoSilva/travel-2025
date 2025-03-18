import { useState } from 'react';

export default function PreViewFooter() {
    const [stateFooter, setStateFooter] = useState(false);
    const [stateTextarea, setStateTextarea] = useState('');

    const handleTextarea = (e) => {
        setStateTextarea(e.target.value);
    }

    return (
        <>
            <style>
                {`
                    .imgFooter {
                        position: absolute;
                        bottom: 9%;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 90%;
                        height: 100px;
                        border-radius: 8px;
                        display: flex;
                        flex-direction: row;
                        overflow: hidden;
                        z-index: 1;
                        background-color: #fddfcd;
                        transition: height 0.3s ease-in-out;

                        &.isView {
                            height: 50px;  
                        }

                        .imgFooterBody {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            padding: 15px;

                            p {
                                color: #646464;
                                font-size: 14px;
                                padding: 0 8px;
                                border-left: 2px solid #646464;
                            }

                            textarea {
                                width: 100%;
                                height: 100%;
                                border-radius: 5px;
                                padding: 4px 8px;
                                outline: none;
                                font-size: 16px;
                                color: #000;
                                resize: none;
                            }
                        }

                        .imgFooterAction {
                            width: 150px;
                            height: 100%;
                            display: flex;
                            justify-content: end;
                            padding-right: 12px;
                            align-items: center;

                            font-size: 14px;
                            font-weight: 500;
                            color: #fff;

                            button {
                                background-color: #ea580c;
                                border-radius: 8px;
                                padding: 8px 15px;
                                outline: none;
                                border: none;
                                cursor: pointer;
                            }
                        }
                        
                        @media (max-width: 768px) {
                            &:not(.isView) {
                                flex-direction: column;
                                height: fit-content;

                                .imgFooterAction {
                                    width: 100%;
                                    height: 45px;
                                    justify-content: center;
                                    margin-bottom: 15px;
                                    padding: 0 15px;

                                    button {
                                        width: 100%;
                                        height: 100%;
                                    }
                                }
                            }
                    }
                `}
            </style>
            <div className={'imgFooter ' + (stateFooter ? '' : 'isView')}>
                <div className='imgFooterBody'>
                    {
                        stateFooter ?
                            <textarea placeholder='Escriba eso que estas pensado' onChange={handleTextarea} value={stateTextarea}></textarea> :
                            <p {...(stateTextarea.trim() ? {} : { "data-isempty": true })}>{stateTextarea.trim() ? stateTextarea : "Sin pie de imagen"}</p>
                    }
                </div>
                <div className='imgFooterAction'>
                    <button type='button' className='' onClick={() => setStateFooter(!stateFooter)}>
                        {
                            stateFooter ? 'Guardar' : 'Añadir'
                        }
                    </button>
                </div>
            </div>
        </>
    )
}