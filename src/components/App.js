import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId();
      console.log('net id', netId);

      const accounts = await web3.eth.getAccounts();
      console.log('accounts', accounts);

      const balance = await web3.eth.getBalance(accounts[0])
      console.log('balance', balance);
        this.setState({
          account: accounts[0],
          balance: balance,
          web3: web3,
        })

        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address );
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address );
        const dBankAddress = dBank.networks[netId].address;
        this.setState({
          token: token,
          dbank: dbank,
          dBankAddress: dBankAddress,
        })
        console.log('dbank address', dBankAddress);

        const tokenBalance = await token.methods.balanceOf(this.state.account).call()
        console.log( 'token balance', web3.utils.fromWei(tokenBalance.toString()))

        await this.checkDepositBalance();
        await this.checkInterestBalance();
        


    } else {
      window.alert('Please install MetaMask')
    }

    //check if MetaMask exists

      //assign to values to variables: web3, netId, accounts

      //check if account is detected, then load balance&setStates, elsepush alert

      //in try block load contracts

    //if MetaMask not exists push alert
  }

  async checkDepositBalance() {
    const depositBalance =  await this.state.dbank.methods.checkBalance().call({from:this.state.account});
    this.setState({
      depositBalance: depositBalance,
    })
    console.log('deposit balance', depositBalance)
  }

  async checkInterestBalance() {
    const depositTime =  await this.state.dbank.methods.checkDepositTime().call({from:this.state.account});
    console.log('deposit time', depositTime)
    var date = new Date();
    date = parseInt( date.getTime() /1000);
    const holdTime = date - depositTime;
    console.log('current time', date)
    console.log('deposit time', depositTime)
    console.log('hold time', holdTime)
    console.log('deposit Valium', this.state.depositBalance )

    const interestPerSecond = 31668017 * ( this.state.depositBalance / 1e16)
    console.log('interest per second', interestPerSecond);

    const interestBalance =(interestPerSecond * holdTime) /1e18;

    this.setState({
      interestBalance: interestBalance,
    })
    console.log('interest balance', interestBalance)
  }

  async deposit(amount) {
    //check if this.state.dbank is ok
      //in try block call dBank deposit();
      console.log('deposit amount', amount)
      try {
        await this.state.dbank.methods.deposit().send({value:amount.toString(), from:this.state.account})
        await this.checkDepositBalance();
      } catch(e) {
        console.log('Error, deposit: ', e  )
      }
  }

  async withdraw(amount) {
    //prevent button from default click
    //check if this.state.dbank is ok
    //in try block call dBank withdraw();
          //in try block call dBank deposit();
    console.log('withdraw amount', amount)

    try {
      await this.state.dbank.methods.withdraw().send({from:this.state.account})
      await this.checkDepositBalance();
      await this.checkInterestBalance();
    } catch(e) {
      console.log('Error, withdraw: ', e  )
    }
  }

  componentDidMount() {
    console.log('mason mount')
    var intervalId = setInterval(this.intervalLoop.bind(this), 1000);
  }

  intervalLoop() {
    console.log('looping')
    this.checkInterestBalance();    
  } 

  handleDepositChange(event) {
    this.setState({
      depositValue: event.target.value,
    })
  }

  handleWithdrawChange(event) {
    this.setState({
      withdrawValue: event.target.value,
    })
  }

  handleDepositSubmit(e) {
    var amount = this.state.depositValue;
    amount = amount * 10**18;
    this.deposit(amount);
    e.preventDefault();
  }

  handleWithdrawSubmit(event) {
    var amount = this.state.withdrawValue;
    amount = amount * 10**18;
    this.withdraw(amount);

    event.preventDefault();
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      depositValue: "",
      withdrawValue:"",
      depositBalance:null,
      interestBalance:null,
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1> Welcome to Pooh Bank</h1>
          <p>{ "Your address: " + this.state.account}</p>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <p> ยอดเงินฝาก ETH ในธนาคาร dbank: {this.state.depositBalance}</p>
                <p> ยอดดอกเบี้ย DBC: {this.state.interestBalance}</p>
                <h1> Deposit </h1> 
                <form onSubmit={this.handleDepositSubmit.bind(this)}> 
                  <label>
                    Deposit Value:
                    <input step="0.01" type="number"  type="text" value={this.state.depositValue} onChange={this.handleDepositChange.bind(this)} />
                      </label>
                      <input type="submit" value="Submit" />
                </form>
                <div style={{height:100}}></div>
                <h1> Withdraw </h1>
                <form onSubmit={this.handleWithdrawSubmit.bind(this)}>
                  <label>
                    Withdraw Value:
                    <input  type="text" value={this.state.withdrawValue} onChange={this.handleWithdrawChange.bind(this)} />
                  </label>
                  <input type="submit" value="Submit" />
                </form>

              {/* <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
              </Tabs> */}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;