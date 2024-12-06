<template>
    <!-- Connect wallet container -->
    <div class="container"> 
        <button @click="connectionWallet" class="btn">Connect wallet</button>
        <p>User address: {{ $store.state.address }}</p>
        <p> Chain ID: {{ $store.state.chainId }}</p>
    </div>
    <!-- Send eth to another account -->
    <div class="container">
        <h1 class="header1">Send eth to account</h1>
        <input v-model="txValue" class="input" placeholder="Enter sum that you want to send">
        <button @click="sendTx" class="btn">Send</button>
        <div v-if="tHash" class="link-container">
            <a :href="`https://sepolia.etherscan.io/tx/${tHash}`" target="_blank" class="link">
                View Transaction on Etherscan
            </a>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default{
    data(){
        return{
            to: "",
            txValue: "",
        }
    },
    computed: {
        ...mapState({
        contractAddress: state => state.multisigAddress
        })
    },
    methods:{
        ...mapActions({
            connectionWallet: "connectionWallet",
            sendTransaction: "sendTransaction",
        }),
        async sendTx(){
            this.tHash = await this.$store.dispatch('sendTransaction', {value: this.txValue})
            this.txValue = ""
        },
    },
    mounted(){
        this.connectionWallet()
    },
}
</script>

<style>
</style>

