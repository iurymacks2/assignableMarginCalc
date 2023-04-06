// axios
const axios = require('axios').default;

const domain = process.env.VUE_APP_URL
console.log("EM AXIOSSSSS "+process.env.VUE_APP_URL)

const axiosApi =  axios.create({
  domain,

  baseURL: "https://api.portaldatransparencia.gov.br/api-de-dados/",
  headers: {
    "Content-Type": "application/json",
    "chave-api-dados": "f15dd9431b50cccdd8f10d7bab378453"
    //"access_token": process.env.ACCESS_TOKEN
  }

})
module.exports = { axiosApi }

