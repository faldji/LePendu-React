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
            masqueId: 0,
            display: '',
            ended: false,
            tryOut: 0,
            winLose: 6,
        }
    }

    /**
     * Initialisation et récupération des données à partir de l'API
     */
    componentDidMount() {
    }

    /**
     * Fonction d'appel de l'API
     * Utilisation de la fonction flêchée pour gérer le binding this
     *
     */
    handleNewGame = () => {
        const rndMotIndex = Math.floor((Math.random() * 5)+1);
        const httpInput = "https://my-json-server.typicode.com/faldji/AsvamApiREST_PHP/mots/"+rndMotIndex;
        fetch(httpInput)
            .then((value) => value.json())
            .then((value) => {
                const view = value.masque.replace(/\w/g, (letter) => (letter === ' ' ? ' ' : '-'));
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
                        masqueId: rndMotIndex, display: view, startGame: true,  ended: false, tryOut: 0,
                        toggleUser: false, winLose: 6,
                    });
                });
            })
            .catch(reason => console.error(reason));

    };

    /**
     * Fonction de génération du nouveau masque
     * @param id : int
     * @param disp : string
     * @param curLet : Alphabet
     * Utilisation de la fonction flêchée pour gérer le binding this
     *
     */
    generateNewDisplay(id,disp,curLet) {
        const httpInput = "https://my-json-server.typicode.com/faldji/AsvamApiREST_PHP/mots/"+id;
        fetch(httpInput)
            .then((value) => value.json())
            .then((value) => {
                const {ended,display,tryOut, winLose} = this.state;
                let isEnded = ended;
                const nTryout = tryOut + 1;
                const newDisplay = value.masque.replace(/\w/g,
                (letter, index) =>
                    (curLet.letter === letter.toUpperCase() &&
                    disp.charAt(index) === '-' ? letter.toUpperCase() : disp.charAt(index)));
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
                                        if (item.id === curLet.id){
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
                                            item.main = item.name + ' a trouvé ' + curLet.letter;
                                        return item;
                                    }
                                ),
                                startGame: !isEnded,
                                ended: isEnded,
                                tryOut: nTryout,
                                display: newDisplay,
                                toggleUser: prevState.winLose > 1 && !isWordOk  ? !prevState.toggleUser : prevState.toggleUser,
                                winLose: !isWordOk && prevState.winLose > 0 ? prevState.winLose - 1 : prevState.winLose,
                            });
                        }
                    );
            }
            )
            .catch(reason => console.error(reason));
    }

    /**
     * Fonction de gestion de l'évenement du click sur un boutton du keyboard
     * @param id : int
     * Utilisation de la fonction flêchée pour gérer le binding this
     *
     */
    handleClickBtn = (id) => {
        const {letters, masqueId,  display, users, toggleUser} = this.state;
        const currentLetter = letters.find((lt) => lt.id === id);
        const currUser = toggleUser ? users[1] : users[0];
        currUser.main = currentLetter.letter;
        this.generateNewDisplay(masqueId, display,currentLetter);
    };

    /**
     * Render
     * @returns {*}
     */
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
                    {startGame && <div className="masque-container">{display}</div>}
                    <div className="Keyboard-container">
                        {startGame && !ended ? keboardArray : btnNg}
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
