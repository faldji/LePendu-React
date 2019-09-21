import React from 'react';
const keyboard = ({letters, handleClickBtn}) =>{
    const btnClass = (letters.colored) ? ' btn btn-green':'btn btn-red';
    return (
        <button disabled={letters.disabled}
                className={letters.disabled ?  btnClass :'btn'} onClick={() => handleClickBtn(letters.id)}>
            {letters.letter}
        </button>
    );
};
export default keyboard;
