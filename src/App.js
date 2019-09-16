import React, {Component} from 'react';
import './App.css';
import Alphabet from './alphabet.js'
import Keyboard from "./Keyboard";
import hangman6 from './hangman6.png';
import hangman5 from './hangman5.png';
import hangman4 from './hangman4.png';
import hangman3 from './hangman3.png';
import hangman2 from './hangman2.png';
import hangman1 from './hangman1.png';
import hangman0 from './hangman0.png';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            letters: Alphabet,
            users: [{id: 1, name: "Joueur1", main: ''}, {id: 2, name: "Joueur2", main: ''}],
            toggleUser: false,
            startGame: false,
            masque: '',
            display: '',
            ended: false,
            tryOut: 0,
            winLose: 6,
        }
    }

    // utilisation de la fonction flêchée pour gérer le binding this
    handleClickBtn = (id) => {
        const {letters, masque, ended, display, tryOut, users, toggleUser, winLose} = this.state;
        const currentLetter = letters.find((lt) => lt.id === id);
        let isEnded = ended;
        const nTryout = tryOut + 1;
        const currUser = toggleUser ? users[1] : users[0];
        currUser.main = currentLetter.letter;
        const newDisplay = masque.replace(/\w/g,
            (letter, index) => (currentLetter.letter === letter.toUpperCase() && display.charAt(index) === '-' ? letter.toUpperCase() : display.charAt(index)));
        isEnded = !newDisplay.includes('-');
        const isWordOk = display !== newDisplay;
        if (winLose === 1 && !isWordOk) {
            isEnded = true;
        }

        this.setState(
            prevState => {
                return ({
                    letters: prevState.letters.map(
                        (item) => {
                            if (item.id === currentLetter.id){
                              item.disabled = true;
                              if (isWordOk)
                              item.validated = true;
                            }
                            return item;
                        }
                    ),
                    users: prevState.users.map(
                        (item) => {
                            if (!isWordOk)
                                item.main = 'Au tours du ' + item.name;
                            else
                                item.main = item.name + ' a trouvé ' + currentLetter.letter;
                            return item;
                        }
                    ),
                    startGame: !isEnded,
                    display: newDisplay,
                    ended: isEnded,
                    tryOut: nTryout,
                    toggleUser: prevState.winLose > 1 ? !prevState.toggleUser : prevState.toggleUser,
                    winLose: !isWordOk && prevState.winLose > 0 ? prevState.winLose - 1 : prevState.winLose,
                });
            }
        );
    };
    handleNewGame = () => {
        const mot = this.generateNewMask();
        const view = mot.replace(/\w/g, (letter) => (letter === ' ' ? ' ' : '-'));
        this.setState(prevState => {
            return ({
                letters: prevState.letters.map(
                    item => {
                        if (item.disabled)
                            item.disabled = false;
                        if (item.validated)
                          item.validated = false;
                        return item;
                    }),
                users: prevState.users.map(
                    (item) => {
                        item.main = '';
                        return item;
                    }
                ),
                startGame: true, masque: mot, display: view, ended: false, tryOut: 0, toggleUser: false, winLose: 6
            });
        });
    };

    generateNewMask() {
        const mots = ["test", "Le pendu", "reactjs", "jeux", "je me forme en react"];
        const rndMotIdn = Math.floor(Math.random() * mots.length);
        return mots[rndMotIdn];
    }

    render() {
        const {letters, display, startGame, tryOut, users, toggleUser, winLose, ended} = this.state;
        const hangmans = [hangman0, hangman1, hangman2, hangman3, hangman4, hangman5, hangman6];
        const hangman = hangmans[winLose];
        const lastUser = !toggleUser ? users[0] : users[1];
        //const isGameEnd = ended ?'block':'none';
        const newGameMask = lastUser.main !== "" ? 'block' : 'none';
        const keboardArray = letters.map(
            item => <Keyboard key={item.id} letters={item} handleClickBtn={this.handleClickBtn}/>);
        const btnNg = <button className="btn-new" onClick={this.handleNewGame}>Start new game</button>;
        const lostWinLose = <div className="lost-game">{lastUser.name} a perdu.</div>;
        const winWinLose = <div className="won-game">{lastUser.name} a gagné.</div>;

        return (
            <div className="container">
                <div className="nbr-try">
                    Essaie : {tryOut}
                </div>
                <div className="App">
                    <img className="hangman" alt="hangman" src={hangman}/>
                    <div className="masque-container">{display}</div>
                    <div className="Keyboard-container">
                        {startGame ? keboardArray : btnNg}
                    </div>
                    <div style={{display: newGameMask}} className="main-joueur">
                        <span> {lastUser.main}</span>
                    </div>
                    {winLose === 0 && ended && lostWinLose}
                    {winLose > 0 && ended && winWinLose}
                </div>
            </div>
        );
    }


}

export default App;
