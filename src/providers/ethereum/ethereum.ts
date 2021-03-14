
import { Injectable } from '@angular/core';
var Token  = require('./Token.json');
var EthSwap  = require('./EthSwap.json');
import Web3 from 'web3';
import _ from 'lodash';
import Bip39 from 'bip39';
import HDKey from 'hdkey';
import ethLib from 'eth-lib';
import { AppConfig } from '../../env';


declare global { interface Window { ethereum: any; } }
declare global { interface Window { web3: any; } }




@Injectable()
export class EthereumProvider {
  private web3: any;
  private root: HDKey.HDKey;
  private accountAddress: string;
  private privateKey: string;
  private publicKey: string;
  private mnemonic: string;
  accounts:any;
  token:any;
  networkId:any;
  ethswap:any;

  constructor(
  ) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(AppConfig.ethereum.provider));
    this.web3.eth.net.getNetworkType(function(err, res){
      console.log("Network Type: "+res);
    });
    this.accountAddress = AppConfig.ethereum.account;
    this.privateKey = AppConfig.ethereum.privateKey;
    this.loadWeb3()
    this.loadBlockchainData()


  }


   async loadBlockchainData() {

       this.networkId =  await this.web3.eth.net.getId()

       var tokenData = Token.networks[this.networkId]

       var ethData = EthSwap.networks[this.networkId]

       console.log('ethData.address',ethData)

       this.token = new this.web3.eth.Contract(Token.abi, tokenData.address)

       this.ethswap = new this.web3.eth.Contract(EthSwap.abi, ethData.address)



       let balance=await this.token.methods.balanceOf(this.ethswap.address).call()

        let balance2=await this.token.methods.balanceOf(this.token.address).call()

       console.log('balance ethswap.....',balance2.toString())
       

       console.log('balance ethswap.....',balance.toString())
       
       this.accounts = await this.web3.eth.getAccounts()

       console.log(this.accounts)

       let balance3=await this.token.methods.balanceOf(this.accounts[1]).call()

       console.log('balance ethswap.....',balance3.toString())



  

  }

    async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async getAddress(){

     this.accounts = await this.web3.eth.getAccounts()

     return this.accounts[0]

  }


  async getBalanceToken(){

        let balance=await this.token.methods.balanceOf(this.ethswap.address).call()

        let balance2=await this.token.methods.balanceOf(this.token.address).call()

        let balance3=await this.token.methods.balanceOf(this.accounts[1]).call()

        console.log('balance ethswap.....',balance2.toString())

        console.log('balance ethswap.....',balance.toString())

        console.log('balance ethswap.....',balance3.toString())
  }



  async transfer(){


    this.token.methods.transfer(this.ethswap.address,100000).send({from: this.accounts[0]})
    .then(function(receipt){
        // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
    });

     
   /*

    this.ethswap.methods.buyTokens().send({ value: '3210', from: "0xc460160A3CFe83Ff12d33332f5D92b14C732774E" }).on('transactionHash', (hash) => {

      console.log('hash',hash)
     
    })
    */
   



  }


  async getBalance(){



  }




  public getValue (key: string) {
    return _.get(this.web3, key);
  }

  public generateMnemonic() {
    this.mnemonic = Bip39.generateMnemonic();
  }

  public generateAccountFromMnemonic(mnemonic: string) {
    if (!mnemonic) mnemonic = this.mnemonic;
    const seed = Bip39.mnemonicToSeed(mnemonic); //creates seed buffer
    this.root = HDKey.fromMasterSeed(seed);
    this.privateKey = this.root.privateKey.toString('hex');
    const account = this.web3.eth.accounts.privateKeyToAccount('0x' + this.privateKey);
    this.accountAddress = account.address;
  }

  public generateAccount() {
    const account = this.web3.eth.accounts.create();
    this.accountAddress = account.address.substr(2);
    this.privateKey = account.privateKey.substr(2);
  }
  /*
  public async getBalance() {
    let balance = 0;
    if (this.accountAddress) {
      balance = await this.web3.eth.getBalance(this.accountAddress);
      balance = (balance !== 0) ? this.web3.utils.fromWei(balance, 'ether') : 0;
    }
    return balance;
  }

  */


  public async sendTransaction(address: string, amount: number) {
    const account = this.web3.eth.accounts.privateKeyToAccount('0x' + this.privateKey);
    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = account.address;

    const params = {
      //nonce: 0,
      to: address,
      //from: this.accountAddress,
      value: this.web3.utils.toWei(amount.toString(), 'ether'),
      gasPrice: 5000000000,
      gasLimit: 21000,
      //chainId: 3
    };

    const transaction = await this.web3.eth.sendTransaction(params);
    return transaction.transactionHash;
  }

  public async signTransaction(address: string, amount: number) {
    const params = {
      to: address,
      value: this.web3.utils.toWei(amount.toString(), 'ether'),
      gasPrice: 5000000000,
      gasLimit: 21000,
    };
    const transaction = await this.web3.eth.accounts.signTransaction(params, '0x' + this.privateKey);
    return transaction;
  }

  public getPrivateKey() {
    return this.privateKey;
  }

  public getAccount () {
    return this.accountAddress;
  }
  public getMnemonic () {
    return this.mnemonic;
  }

  public async getGasPrice() {
    return await this.web3.eth.getGasPrice();
  }
  
  public async getChainId() {
    return await this.web3.eth.net.getId()
  }  
}
