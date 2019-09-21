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
import Axios from "axios";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            letters: Alphabet,
            users: [{id: 1, name: "Joueur1", main: ''}, {id: 2, name: "Joueur2", main: ''}],
            toggleUser: false,
            startGame: true,
            masqueId: 0,
            display: '',
            ended: false,
            tryOut: 0,
            waitAPI:false,
            winLose: 6,
        }
    }

    /**
     * Initialisation et récupération des données à partir de l'API
     */
    componentDidMount() {

        const httpInput = "http://localhost:8000/api/genMots";
        Axios.get(httpInput)
            .then(value => {this.setState({waitAPI:true,masqueId:value.data.id, display: value.data.display});})
            .catch(reason => console.error(reason))
    }

    /**
     * Fonction  de gestion du click sur le boutton nouvelle partie
     * Utilisation de la fonction flêchée pour gérer le binding this
     *
     */
    handleNewGameBtn =  () => {
        if (this.state.waitAPI){
            const httpInput = "http://localhost:8000/api/genMots";
            this.setState({waitAPI:false});
            Axios(httpInput)
            .then((value) => {
                this.setState(prevState => {
                    return ({
                        letters: prevState.letters.map(
                            item => {item.colored=false; item.disabled=false;return item; }),
                        users: prevState.users.map(
                            item => { item.main = ''; return item; }) ,
                        masqueId: value.data.id, display: value.data.display, startGame: true,  ended: false, tryOut: 0,
                        toggleUser: false, winLose: 6,waitAPI: true,
                    });
                });
            })
            .catch(reason => console.error(reason));}

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
        const httpInput = "http://localhost:8000/api/checkMots?id="+id+"&display="+disp+"&letter="+curLet.letter;
        Axios(httpInput)
            .then(value => {
                    console.log(value.data);
                const isWordOk = value.data.isMotOk;
                const isEnded = (this.state.winLose === 1 && !isWordOk) ?true : value.data.isEnded;
                    this.setState(
                        prevState => {
                            return ({
                                letters: prevState.letters.map(
                                    (item) => {
                                        if (item.id === curLet.id){
                                            item.disabled = true;
                                            if (isWordOk)
                                                item.colored = true;
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
                                waitAPI:true,
                                startGame: !isEnded,
                                ended: isEnded,
                                tryOut: prevState.tryOut +1,
                                display: value.data.newMasque,
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
        const {letters, masqueId,  display,waitAPI} = this.state;
        if (waitAPI){
            this.setState({waitAPI:false});
            this.generateNewDisplay(masqueId, display,letters.find((lt) => lt.id === id));
        }

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
        const btnNg = <button className="btn-new" onClick={this.handleNewGameBtn}>Start new game</button>;
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
