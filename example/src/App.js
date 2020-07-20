import React from 'react'
import Web3 from "web3"

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroup,
  Row,
  Col,
  Container,
} from 'reactstrap';

let web3
const factory = require("./web3/Factory.json")
const factoryAddress = "0xe934Af2721B6CCC48E30035da06b1b29172dCabE"
const counter = require("./web3/Counter.json")
const counterAddress = "0xFbf0aE7df113Ac2D4035f07e8a3aF828c02a512B"
const token = require("./web3/ERC20.json")
const tokenAddress = "0xF523d2Cc4B27835299E58C82B6E1807c3a118Ade"
const proxy = require("./web3/Gastraction.json")

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      web3Available: false,
      networkID: "",
      
      factory: "",
      counter: "",
      token: "",
      proxy: "",
      proxyAddress: "0x0",
      
      owner: "0x0",
      number: 0,
      balance: 0,
      claimed: true,
    }
  }
  componentDidMount() {
    this.startWeb3()
  }
  componentDidUpdate() {
    window.ethereum.on('accountsChanged', async function () {
      this.getWeb3Data()
    }.bind(this))
    window.ethereum.on('chainChanged', async function (netId) {
      this.setState({networkID: netId})
    }.bind(this))
  }
  async startWeb3 () {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false
      web3 = new Web3(window.ethereum)
      web3.eth.net.getId().then(netId => this.setState({networkID: netId}))
      this.setState({web3Available: true})
    }
    // Legacy DApp Browsers
    else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider)
      web3.eth.net.getId().then(netId => this.setState({networkID: netId}))
      this.setState({web3Available: true});
    }
    // Non-DApp Browsers
    else {
      this.setState({web3Available: false})
    }
    this.getWeb3Data()
  }
  async getWeb3Data () {
    //Get current account
    await this.setState({owner: await web3.eth.getCoinbase()})
    await this.setState({factory: await new web3.eth.Contract(factory.abi,
      factoryAddress)})
    await this.setState({counter: await new web3.eth.Contract(counter.abi,
      counterAddress)})
    await this.setState({token: await new web3.eth.Contract(token.abi,
      tokenAddress)})
    let _proxy = await this.state.factory.methods.proxy(this.state.owner, tokenAddress).call()
    await this.setState({proxyAddress: _proxy})
    await this.setState({proxy: await new web3.eth.Contract(proxy.abi, this.state.proxyAddress)})
    this.setState({number: await this.state.counter.methods.count(this.state.proxyAddress).call()})
    this.setState({balance: await this.state.token.methods.balanceOf(this.state.proxyAddress).call()})
    this.setState({claimed: await this.state.token.methods.minted(this.state.proxyAddress).call()})
  }
  async add () {
    let estimate = await this.state.proxy.methods.tokenGas(counterAddress, "0x4f2be91f", "2000000000000000000", 1000000).estimateGas({from: this.state.owner})
    await this.state.proxy.methods.tokenGas(counterAddress, "0x4f2be91f", "10000000000000000000", estimate).send({from: this.state.owner})
    this.getWeb3Data()
  }
  async create () {
    await this.state.factory.methods.createProxy(tokenAddress).send({from: this.state.owner})
    this.getWeb3Data()
  }
  async claim() {
    await this.state.proxy.methods.etherGas("0xF523d2Cc4B27835299E58C82B6E1807c3a118Ade", "0x1249c58b").send({from: this.state.owner})
    this.getWeb3Data()
  }
  claimer () {
    if (this.state.claimed === false) {
      return (
        <div>
          <Button 
            className="mt-0" 
            color="primary" 
            type="button"
            onClick={() => this.claim()}
          >
            Claim tokens
          </Button>
        </div>
      )
    } 
  }
  renderProxy () {
    if (this.state.proxyAddress === "0x0000000000000000000000000000000000000000") {
      return (
        <Row className="justify-content-center">
            <Card className="bg-secondary shadow border-0">
              <CardHeader className="bg-transparent pb-1">
                <div className="text-center mt-2 mb-4">
                Create proxy for {this.state.owner}
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <Form role="form">
                  <Row className="justify-content-center">
                    <Button 
                      className="mt-0" 
                      color="primary" 
                      type="button"
                      onClick={() => this.create()}
                    >
                      Create
                    </Button>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Row>
      );
    }
    else {
      return (
        <Row className="justify-content-center">
          <Col lg="6" md="8">
            <Card className="bg-secondary shadow border-0">
              <CardHeader className="bg-transparent pb-1">
                <div className="text-center mt-2 mb-4">
                Send a transaction and pay for gas using your tokens
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-5">
                <Form role="form">
                  <Row className="justify-content-center">
                    <Col lg="6" md="4">
                      <FormGroup>
                        <InputGroup className="input-group-alternative mb-3">
                          <Input 
                            readOnly
                            value={this.state.number}
                            type="text"
                          />
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col lg="6" md="4"> 
                      <Button 
                        className="mt-0" 
                        color="primary" 
                        type="button"
                        onClick={() => this.add()}
                      >
                        Add counter
                      </Button>
                    </Col>  
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6" md="8">
            <Card className="bg-secondary shadow border-0">
                <CardHeader className="bg-transparent pb-1">
                  <div className="text-center mt-2 mb-4">
                  Proxy wallet {this.state.proxyAddress}
                  </div>
                </CardHeader>
                <CardBody className="px-lg-5 py-lg-5">
                  <Form role="form">
                    <Row className="justify-content-center">
                      <Col lg="4" md="4">
                        <div className="mt-3">Balance Tokens</div>
                      </Col>
                      <Col lg="6" md="4">
                        <FormGroup>
                          <InputGroup className="input-group-alternative mb-3">
                            <Input 
                              readOnly
                              value={(this.state.balance / 10**18).toLocaleString(
                                "en", {minimumFractionDigits: 2, maximumFractionDigits:2}) + " TEST"}
                              type="text"
                            />
                          </InputGroup>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="justify-content-center mt-3">
                      {this.claimer()}
                    </Row>
                  </Form>
                </CardBody>
              </Card>
          </Col>
        </Row>
      );
    };
  }
  render() {
    return (
      <>
        <div className="main-content bg-gradient-primary  pb-250">
          <div className="header py-8">
            <Container>
              <div className="header-body text-center mb-7">
                <Row className="justify-content-center">
                  <Col lg="5" md="6">
                    <h1 className="text-white">Gastraction</h1>
                    <p className="text-lead text-light">
                      Example gastraction dapp
                    </p>
                  </Col>
                </Row>
              </div>
            </Container>
          </div>
          {/* Page content */}
          <Container className="mt--8 pb-5">
            {this.renderProxy()}
          </Container>
        </div>
      </>  
    );
  }
}

export default App;