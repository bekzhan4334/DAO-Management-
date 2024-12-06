import { createStore } from 'vuex'
const ethers = require('ethers')
const provider = new ethers.providers.JsonRpcProvider({
        url: process.env.PROVIDER
})

import {multisigABI} from "@/contracts/Multisig.abi.js"
import {TargetABI} from "@/contracts/Target.abi.js"

export default createStore({
  state: {
    provider: {},
    multisigAddress: "0x3F38Ef5575b546aD9522276495D7b4aa6283Cc36",
    targetAddress: "0xf152014cb1Dc371f5815313c7a806Ef2DEa37850",
    multisig: {},
    target: {},
    chainId: "",
    address: "",
    admins: ["0x2d7d1D48d381E4D2329d10cb49EFa8a7f9103112", "0x4391e7509fD01A5b5b2009Badb6F0D3c6D72899C", "0x368075923971616492dBAb86DaCcC1B24571Ad74"],
    admin: false,
    functionSignature: "sendFunds(address)",
    functionName: "sendFunds",
    message: {},
    newProposal: false,
    enoughSignatures: false,
    eventAddress: "",
    eventValue: "",
  },
  getters: {
  },
  mutations: {
  },
  actions: {
    async connectionWallet({state}){
      if(typeof window.ethereum !== 'undefined'){
        console.log("Ethereum client installed")
        if(ethereum.isMetaMask === true){
          console.log("Metemask installed")
          if(ethereum.isConnected() !== true){
            console.log("Metamask is not connected")
            await ethereum.enable()
          }
          else{
            console.log("Metamask connected")
          }
        }
        else{
          alert("Metamask is not installed")
        }
      }
      else{
        alert("Ethereum client not installed")
      }
      //connecting Metamask account
      await ethereum.request({method: "eth_requestAccounts"})
      .then(accounts => {
        state.address = ethers.utils.getAddress(accounts[0])
        if(state.admins.includes(state.address)){
          state.admin = true
        }
        else{
          state.admin = false
        }
        console.log(`Account ${state.address} connected`)
      })
      //creating provider
      state.provider = new ethers.providers.Web3Provider(ethereum)
      // //saving the info in wallet
      state.chainId = await window.ethereum.request({ method: 'eth_chainId' })
      // state.wallet.chain = network.name

      ethereum.on('accountsChanged', (accounts) => {
        state.address = ethers.utils.getAddress(accounts[0])
        if(state.admins.includes(state.address)){
          state.admin = true
        }
        else{
          state.admin = false
        }
        console.log(`Account changed to ${state.address}`)
      })

      ethereum.on('chainChanged', async (chainId) => {
        state.provider = new ethers.providers.Web3Provider(ethereum)
        //saving the info in wallet
        state.chainId = await window.ethereum.request({ method: 'eth_chainId' })
        console.log(`chainId changed to: ${state.wallet.chainId}`)
      })
    },

    // async sendTransaction({state}, {value}){
    //   let tempValue = ethers.utils.parseUnits(value, "ether")
    //   let tempHash = ""
    //   await ethereum.request({
    //     method: "eth_sendTransaction",
    //     params: [{
    //       from: state.address,
    //       to: state.multisigAddress,
    //       value: tempValue
    //     }]
    //   })
    //   .then(hash => {
    //     tempHash = hash
    //   })
    //   return tempHash
    // },

    async listener({state}, address, value){
      console.log(address)
      console.log(value.toString())
      address = state.eventAddress
      value = state.value
    },
    async newMessage({state}, args){
      const [receiverAddress, value] = args

      // creating instance of the contract
      const multisig = new ethers.Contract(multisigAddress, multisigABI, provider)

      // get nonce for message
      let nonce = await multisig.nonce()
      console.log("Nonce: ", nonce)

      // build payload
      const iFace = new ethers.utils.Interface([functionSignature])
      const payload = iFace.encodeFunctionData(functionName, [receiverAddress])
      console.log("Payload: ", payload)

      const message = ethers.utils.arrayify(ethers.utils.solidityPack(
        ["uint256", "address", "address", "bytes"],
        [nonce, multisigAddress, targetAddress, payload]
      ))
      console.log("Message: ", message)

      const signer = state.provider.getSigner()
      console.log("Signer: ", signer)

      // sign message locally
      const rawSignature = await signer.signMessage(message)
      //getting signature and v r s from rawSignature
      const signature = ethers.utils.splitSignature(rawSignature)
      console.log(signature)
      
      let signatures = {
        v: [signature.v], 
        r: [signature.r],
        s: [signature.s]
      }
      // saving parameters of the message 
      // and signatures

      state.message = {
        nonce: nonce,
        value: value,
        receiver: receiverAddress,
        payload: payload,
        message: message,
        signers: [signer.address],
        signatures: signatures
      }

      // letting know that new proposal was created
      state.newProposal = true
      console.log("Message: ", state.message)

    },

    async signMessage({state}){
      const signer = state.provider.getSigner()
      console.log("Signer: ", signer)

      const rawSignature = await signer.signMessage(state.message.message)

      const signature = ethers.utils.splitSignature(rawSignature)
      
      state.message.signatures.v.push(signature.v)
      state.message.signatures.r.push(signature.r)
      state.message.signatures.s.push(signature.s)

      state.message.signers.push(signer.address)

      console.log("New signer: ", signer.address)
      console.log("Signers count: ", state.message.signers.length)

      if(state.message.signers.length > state.admins.length / 2){
        console.log("Enough singatures")
        state.enoughSignatures = true
      }

    },

    async sendMessage({state}){
       // create multisig Interface
       const iMultisig = new ethers.utils.Interface(multisigABI)

       // build calldate for verify function

       const calldata = iMultisig.encodeFunctionData("verify", 
        [
          state.message.nonce,
          state.targetAddress,
          state.message.payload,
          state.message.signatures.v,
          state.message.signatures.r,
          state.message.signatures.s,
        ]
       )

       // pop up browser wallet and request to send proposal to blockchain

       const txHash = await window.ethereum.request({
        method: "eth_sendTransaction", 
        params: [{
          from: state.address,
          value: state.message.value,
          to: multisigAddress,
          data: calldata
        }]
       })

       console.log("txHash: ", txHash)

       // waitForTranasction

       const recepit = await provider.waitForTransaction(txHash)
       console.log("Receipt: ", receipt)

       // creating instance of the contract
      const target = new ethers.Contract(targetAddress, TargetABI, provider)
      target.on("sentFunds", listener)
    },


  },
  modules: {
  }
})
