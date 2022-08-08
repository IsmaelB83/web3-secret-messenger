/******************************************
 ***            TYPES                   ***
 ******************************************/
const NETWORKS = {
    "1": "Mainnet",
    "3": "Ropsten",
    "4": "Rinkeby",
    "5": "Goerli",
    "42": "Kovan"
}

/******************************************
 ***            GLOBALS                 ***
 ******************************************/
let RemixContract;

/******************************************
 ***            UI COMPONENTS           ***
 ******************************************/
// Buttons
const buttonConnectMetamask = document.getElementById('buttonConnectMetamask');
const buttonConnectGanache = document.getElementById('buttonConnectGanache');
const buttonSendMessage = document.getElementById('buttonSendMessage');
const buttonReloadMessages = document.getElementById('buttonReloadMessages');
const buttonCheckSmartContract = document.getElementById('buttonCheckSmartContract');
// Inputs
const inputEOAddress = document.getElementById('inputEOAddress');
const inputSCAddress = document.getElementById('inputSCAddress');
const inputNewMessage = document.getElementById('inputNewMessage');
const inputMessageHistory = document.getElementById('inputMessageHistory');
// Labels
const labelCurrentNetwork = document.getElementById('labelCurrentNetwork');
// Event Listeners
addEventListeners();

/******************************************
 ***            INIT                   ***
 ******************************************/
connectProvider();
addEventListeners();

/******************************************
 ***            FUNCTIONS               ***
 ******************************************/
/**
 * Connect to web3 provider (either ganache or metamask)
 */
function connectProvider() {
    // Connect a the web3 provider
    if (typeof web3 !== 'undefined') {
        // Connection directly via metamask
        web3 = new Web3(window.ethereum);
        // Prepare UI
        if (ethereum.isConnected()) {
            web3.eth.getAccounts()
            .then(accounts => web3.eth.getChainId().then(chainId => connectedNetwork(accounts, chainId)))
            .catch(error => console.log(error));
        }
    } else {
        // Connection directly to ganache
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
        web3.eth.getAccounts().then(accounts => connectedNetwork(accounts))
    }
}

/**
 * Return an instance of a WEB3 Smart Contract
 * @param {*} sourceAddress Externally owned account
 * @param {*} smartContractAddress Smart contract address
 * @returns {RemixContract} Intance of the smart contract
 */
 function setSmartContract (sourceAddress, smartContractAddress) {
    return new web3.eth.Contract(
        [
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "x",
                        "type": "string"
                    }
                ],
                "name": "setMessage",
                "outputs": [],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getMessage",
                "outputs": [
                    {
                        "name": "",
                        "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
            }
        ], smartContractAddress, {
            from: sourceAddress,       // default from address
            gasPrice: '20000000000',   // default gas price in wei, 20 gwei in this case
            gasLimit: '300000'
        }  
    );
}

/**
 * Attach all event listeners
 */
function addEventListeners() {
    document.addEventListener('DOMContentLoaded', navBarEventHandler);
    window.ethereum.on('accountsChanged', accounts => inputEOAddress.value = accounts);
    window.ethereum.on('chainChanged', chainId => labelCurrentNetwork.innerHTML = NETWORKS[parseInt(chainId, 16)]);
    buttonSendMessage.addEventListener('click', sendMessageEventHandler);
    buttonReloadMessages.addEventListener('click', reloadMessagesEventListener);
    buttonConnectMetamask.addEventListener('click', connectMetamaskEventHandler);
    buttonConnectGanache.addEventListener('click', connectGanacheEventHandler);
    buttonCheckSmartContract.addEventListener('click', checkSmartContract);
    inputSCAddress.addEventListener('input', (e) => {})
}

/**
 * Called when the connection is established
 * @param {*} accounts 
 * @param {*} network
 */
function connectedNetwork(accounts, network) {
    if (accounts) {
        web3.eth.defaultAccount = accounts[0].toLowerCase();
        inputEOAddress.value = accounts[0].toLowerCase();
        if (!network) 
            labelCurrentNetwork.innerHTML = 'Ganache'
        else 
            labelCurrentNetwork.innerHTML = NETWORKS[network]   
        buttonCheckSmartContract.disabled = false;   
    }
}

/******************************************
 ***            EVENT HANDLERS          ***
 ******************************************/
/**
 * Check smart contract address
 */
function checkSmartContract() {
    try {
        RemixContract = setSmartContract(inputEOAddress.value, inputSCAddress.value);
        buttonReloadMessages.disabled = false;
        buttonSendMessage.disabled = false;
    } catch (error) {
        console.log(error)
        buttonReloadMessages.disabled = true;
        buttonSendMessage.disabled = true;
    }
}

/**
 * Send message to smart contract
 */
function sendMessageEventHandler() {
    const message = document.getElementById('newMessageInput');
    RemixContract.methods.setMessage(inputNewMessage.value).send();
}

/**
 * Reload messages from smart contract
 */
 function reloadMessagesEventListener() {
    RemixContract.methods.getMessage().call().then(txt => inputMessageHistory.value = txt)
}

/**
 * Connect to the metamask API
 */
async function connectMetamaskEventHandler() {
    web3 = new Web3(window.ethereum);
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => web3.eth.getChainId().then(chainId => connectedNetwork(accounts, chainId)))
    .catch(error => alert(error.message))
}

/**
 * Connect to the ganache via web3
 */
 async function connectGanacheEventHandler() {
     try {
        web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
        connectedNetwork(await web3.eth.getAccounts())         
     } catch (error) {
        alert(error.message)
    }
}

/**
 * Navbar javascript event handler
 */
function navBarEventHandler() {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    // Add a click event on each of them
    $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
            // Get the target from the "data-target" attribute
            const target = el.dataset.target;
            const $target = document.getElementById(target);
            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
        });
    });
}