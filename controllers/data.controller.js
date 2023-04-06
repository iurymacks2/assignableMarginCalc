const { axiosApi } = require("../axios.js");

//createBranch
exports.dataclient = async (req, res) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  let monthFormated = month;
  console.log(req.body.cpf)
  if(month < 10)
    monthFormated = "01"+month;
  try {
    // const dataServidor = await axiosApi.get(`servidores/remuneracao?id=73312656&mesAno=${year}${monthFormated}&pagina=1`,
    const dataServidor = await axiosApi.get(`servidores/remuneracao?cpf=${req.body.cpf}&mesAno=${year}${monthFormated}&pagina=1`,
    {
      headers: {
        "Content-Type": "application/json",
        "chave-api-dados": "f15dd9431b50cccdd8f10d7bab378453"
        //"access_token": process.env.ACCESS_TOKEN
      }
    }
    );

    if (dataServidor) {
      res.status(200).json(assignableMarginAdditionalCalc(dataServidor.data));
    } else {
      res.status(500).send({ message: error.message });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

function assignableMarginAdditionalCalc(dataClient) {
  if(!dataClient)
    return {};
  dataClient = dataClient[0];
  let remunerationObj = dataClient.remuneracoesDTO;
  const clientObj = dataClient.servidor;
  if(remunerationObj.length==0)
    return {};
  remunerationObj = remunerationObj[0];
  let remuneration = formatStringValueToFloat(remunerationObj.remuneracaoBasicaBruta);
  let officialPension = (-1)*formatStringValueToFloat(remunerationObj.previdenciaOficial);
  let withholdingTax = (-1)*formatStringValueToFloat(remunerationObj.impostoRetidoNaFonte);
  let anotherValuesDeductions = (-1)*formatStringValueToFloat(remunerationObj.outrasDeducoesObrigatorias);

  let rubricas = remunerationObj.rubricas;
  let totalNet = 0;
  rubricas.forEach(element => {
    totalNet += formatStringValueToFloat(element.valor);
  });

  //let netRemuneration = remuneration-officialPension-withholdingTax;
  let netRemuneration = totalNet;
  let newRemuneration = formatStringValueToFloat(remuneration)*1.09;

  let irrf = 0.0;
  // Any cases of the client dont have the irrf deducting
  if( withholdingTax > 0) {
    irrf = irrfCalc(remuneration-anotherValuesDeductions-officialPension);
  }

  let dependents = 0;
  if(irrf > withholdingTax){
    let continueFindChildren = true
    let dep = 1;
    let minDif = 99999999999;
    let irrfCalcTest = irrfCalc(remuneration - (dep*189.59) - officialPension - anotherValuesDeductions);
    while (continueFindChildren) {  
      if(irrfCalcTest > withholdingTax) {
        if(Math.abs(irrfCalcTest-withholdingTax) < minDif) {
          minDif = Math.abs(irrfCalcTest-withholdingTax);       
        }
        dep += 1;
      } else {
        if(Math.abs(irrfCalcTest-withholdingTax) < minDif) {
          minDif = Math.abs(irrfCalcTest-withholdingTax);
          dep += 1;
        }
        continueFindChildren = false;
      }
      irrfCalcTest = irrfCalc(remuneration - (dep*189.59) - officialPension);
    }
    dependents = dep;
  }
  const newIrrf = irrfCalc(newRemuneration - (dependents*189.59) - officialPensionCalc(newRemuneration));

  let newOfficialPension = 0.0;
  // Any cases of the client dont have the Official Pension deducting
  if( officialPension > 0) {
    newOfficialPension = officialPensionCalc(newRemuneration);
  }

  let assignableMargin = netRemuneration*0.45;
  let assignableMarginNew = (newRemuneration-newIrrf-newOfficialPension)*0.45;
  return {
    clientName: clientObj.pessoa.nome,
    clientCpf: clientObj.pessoa.cpfFormatado,
    remuneration: remuneration,
    netRemuneration: netRemuneration,
    newRemuneration: newRemuneration,
    newNetRemuneration: newRemuneration-newIrrf-newOfficialPension,
    assignableMarginAdditional: assignableMarginNew-assignableMargin
  }
}

function officialPensionCalc(value) {
  if(value <= 1045.00) {
    return value*0.075;
  }
  if(value >= 1045.01 && value <= 2089.60) {
    return value*0.09;
  }
  if(value >= 2089.61 && value <= 3134.40) {
    return value*0.12;
  }
  if(value >= 3134.41 && value <= 6101.06) {
    return value*0.14;
  }
  if(value >= 6101.07 && value <= 10448.00) {
    return value*0.145;
  }
  if(value >= 10448.01 && value <= 20896.00) {
    return value*0.165;
  }
  if(value >= 20896.01 && value <= 40747.20) {
    return value*0.19;
  }
  if(value > 40747.20) {
    return value*0.22;
  }
}

function formatStringValueToFloat(value) {
  let val = value;
  if(typeof(value) !== typeof(""))
    return value;
  val = val.replace(".","");
  val = val.replace(",",".");
  val = val.replace(" ","");
  return parseFloat(val);
}

function irrfCalc(value) {
  let irrf = 0;
  if(value < 1903.99) {
    return 0;
  }
  if(value >= 1903.99 && value <= 2826.65) {
    irrf = (value - 1903.98)*0.075;
    return irrf;
  }
  if(value >= 2826.66 && value <= 3751.05) {
    irrf = 69.2003 + (value - 1903.98)*0.15;
    return irrf;
  }
  if(value >= 3751.06 && value <= 4664.68) {
    irrf = 69.2003 + 138.6600 + (value - 1903.98)*0.225;
    return irrf;
  }
  if(value > 4664.68) {
    irrf = 69.2003 + 138.6600 + 205.5667 + (value - 4664.68)*0.27;
    return irrf;
  }
}
