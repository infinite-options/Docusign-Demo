import React, { useState } from "react";
import { Row, Col, Button, Container } from "react-bootstrap";
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from "@mui/material";
import "./docusign.css";
import DeleteIcon from "./DeleteIcon.svg";
import AddIcon from "./AddIcon.svg";

export default function DocuSignLogin() {
  // const classes = useStyles();
  const oAuthServiceProvider = "https://account-d.docusign.com"; // demo
  const implicitGrantPath = "/oauth/auth";
  const userInfoPath = "/oauth/userinfo";
  const oAuthClientID = process.env.REACT_APP_DOCUSIGN_INTEGRATION_KEY; // demo
  const oAuthScopes = "signature cors";
  const eSignBase = "/restapi/v2.1";
  const oAuthReturnUrl = "http://localhost:3000/return-page";

  // Set basic variables
  const dsReturnUrl = "http://localhost:3000/return-page";

  const docUrl = "https://docusign.github.io/examples/docs/anchorfields.pdf";
  const logLevel = 0; // 0 is terse; 9 is v

  let accounts = [];
  let _nonce = null;
  let _loginWindow = null;
  let signingCeremonyWindow = null;
  let defaultAccountIndex = 0;
  let at = "";
  let data = {
    implicitGrant: null,
    userInfo: null,
    callApi: null,
    loggedIn: () => {
      setShowUserDetails(true);
      setShowAddRecipients(true);
    },
  };
  const [defaultAccount, setDefaultAccount] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [userInfo, setUserInfo] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [envelopeDetails, setEnvelopeDetails] = useState([]);
  const [accessTokenExpires, setAccessTokenExpires] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddRecipients, setShowAddRecipients] = useState(false);
  const [showEnvelopeDetails, setShowEnvelopeDetails] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [newFile, setNewFile] = useState([]);

  function handleAddDateTabs(i) {
    const fields = [...recipients];
    fields[i]["tabs"]["dateTabs"] === undefined
      ? (fields[i]["tabs"]["dateTabs"] = [])
      : (fields[i]["tabs"]["dateTabs"] = fields[i]["tabs"]["dateTabs"]);
    fields[i]["tabs"]["dateTabs"].push({
      anchorString: "",
      anchorUnits: "",
      anchorXOffset: "",
      anchorYOffset: "",
      anchorCaseSensitive: true,
    });
    console.log(fields);
    setRecipients(fields);
    // setDateTabs(fields);
  }

  function handleChangeDateTabs(i, event, di) {
    const fields = [...recipients];
    fields[i]["tabs"]["dateTabs"][di][event.target.name] = event.target.value;
    setRecipients(fields);
  }
  function handleAddSignTabs(i) {
    const fields = [...recipients];
    fields[i]["tabs"]["signHereTabs"] === undefined
      ? (fields[i]["tabs"]["signHereTabs"] = [])
      : (fields[i]["tabs"]["signHereTabs"] = fields[i]["tabs"]["signHereTabs"]);
    fields[i]["tabs"]["signHereTabs"].push({
      anchorString: "",
      anchorUnits: "",
      anchorXOffset: "",
      anchorYOffset: "",
      anchorCaseSensitive: true,
    });
    console.log(fields);
    setRecipients(fields);
  }

  function handleChangeSignHereTabs(i, event, shi) {
    const fields = [...recipients];
    fields[i]["tabs"]["signHereTabs"][shi][event.target.name] =
      event.target.value;
    setRecipients(fields);
  }
  function handleAddInitialHereTabs(i) {
    const fields = [...recipients];
    fields[i]["tabs"]["initialHereTabs"] === undefined
      ? (fields[i]["tabs"]["initialHereTabs"] = [])
      : (fields[i]["tabs"]["initialHereTabs"] =
          fields[i]["tabs"]["initialHereTabs"]);
    fields[i]["tabs"]["initialHereTabs"].push({
      anchorString: "",
      anchorUnits: "",
      anchorXOffset: "",
      anchorYOffset: "",
      anchorCaseSensitive: true,
    });
    console.log(fields);
    setRecipients(fields);
  }

  function handleChangeInitialHereTabs(i, event, shi) {
    const fields = [...recipients];
    fields[i]["tabs"]["initialHereTabs"][shi][event.target.name] =
      event.target.value;
    setRecipients(fields);
  }
  function handleAddTextTabs(i) {
    const fields = [...recipients];
    fields[i]["tabs"]["textTabs"] === undefined
      ? (fields[i]["tabs"]["textTabs"] = [])
      : (fields[i]["tabs"]["textTabs"] = fields[i]["tabs"]["textTabs"]);
    fields[i]["tabs"]["textTabs"].push({
      anchorString: "",
      anchorUnits: "",
      anchorXOffset: "",
      anchorYOffset: "",
      anchorCaseSensitive: true,
    });
    console.log(fields);
    setRecipients(fields);
  }

  function handleChangeTextTabs(i, event, ti) {
    const fields = [...recipients];
    fields[i]["tabs"]["textTabs"][ti][event.target.name] = event.target.value;
    setRecipients(fields);
  }
  function handleAddRecipients() {
    const fields = [...recipients];
    fields.push({
      name: "",
      email: "",
      recipientId: "",
      tabs: {},
    });
    setRecipients(fields);
  }
  function handleAddOwnerToRecipients() {
    const fields = [...recipients];
    fields.push({
      name: userInfo.name,
      email: userInfo.email,
      recipientId: "",
      tabs: {},
    });
    setRecipients(fields);
  }
  function handleRemoveRecipients(i) {
    const fields = [...recipients];
    fields.splice(i, 1);
    setRecipients(fields);
  }

  function addRecipients() {
    return (
      <div className="my-2">
        <Container
          responsive="md"
          // classes={{ root: classes.customTable }}
          style={{
            "& .MuiTableCell-sizeSmall": {
              padding: "2px 2px",
              border: "0.5px solid grey ",
            },
            width: "100%",
            tableLayout: "fixed",
            wordBreak: "break-word",
            textOverflow: "scroll",
          }}
          size="small"
        >
          <Row>
            <Col>Name</Col>
            <Col>Email</Col>
            <Col>ID</Col>
            <Col>Tabs</Col>
            <Col>Remove Recipient</Col>
          </Row>

          {recipients.map((recipient, idx) => (
            <Row>
              {" "}
              <Row key={idx}>
                <Col>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={recipient.name}
                    onChange={(e) => handleChangeRecipients(idx, e)}
                  />
                </Col>
                <Col>
                  <input
                    type="text"
                    className="form-control"
                    name="email"
                    value={recipient.email}
                    onChange={(e) => handleChangeRecipients(idx, e)}
                  />
                </Col>
                <Col>
                  <input
                    className="form-control"
                    name="recipientId"
                    value={recipient.recipientId}
                    onChange={(e) => handleChangeRecipients(idx, e)}
                  />
                </Col>
                <Col>
                  <p onClick={() => handleAddDateTabs(idx)}>Date Tabs +</p>{" "}
                  <p onClick={() => handleAddSignTabs(idx)}>Sign Here Tabs +</p>{" "}
                  <p onClick={() => handleAddTextTabs(idx)}>Text Tabs +</p>
                  <p onClick={() => handleAddInitialHereTabs(idx)}>
                    Initial Here Tabs +
                  </p>
                </Col>
                <Col
                  xs={2}
                  style={{
                    padding: "3.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={DeleteIcon}
                    alt="Delete Icon"
                    onClick={() => handleRemoveRecipients(idx)}
                    style={{
                      width: "15px",
                      height: "15px",
                    }}
                  />
                </Col>
              </Row>
              <Row>
                {recipient.tabs.dateTabs &&
                recipient.tabs.dateTabs.length > 0 ? (
                  <div>
                    Date Tabs
                    <div className="my-2">
                      <Container
                        responsive="md"
                        // classes={{ root: classes.customTable }}
                        style={{
                          "& .MuiTableCell-sizeSmall": {
                            padding: "2px 2px",
                            border: "0.5px solid grey ",
                          },
                          width: "100%",
                          tableLayout: "fixed",
                          wordBreak: "break-word",
                          textOverflow: "scroll",
                        }}
                        size="small"
                      >
                        <Row>
                          <Col>Anchor String</Col>
                          <Col>Units</Col>
                          <Col>X OffSet</Col>
                          <Col>Y Offset</Col>
                        </Row>

                        {recipient.tabs.dateTabs.map((dateTab, i) => (
                          <Row key={i}>
                            <Col>
                              <input
                                type="text"
                                className="form-control"
                                name="anchorString"
                                value={dateTab.anchorString}
                                onChange={(e) =>
                                  handleChangeDateTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                type="text"
                                className="form-control"
                                name="anchorUnits"
                                value={dateTab.anchorUnits}
                                onChange={(e) =>
                                  handleChangeDateTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                className="form-control"
                                name="anchorXOffset"
                                value={dateTab.anchorXOffset}
                                onChange={(e) =>
                                  handleChangeDateTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                className="form-control"
                                name="anchorYOffset"
                                value={dateTab.anchorYOffset}
                                onChange={(e) =>
                                  handleChangeDateTabs(idx, e, i)
                                }
                              />
                            </Col>
                          </Row>
                        ))}
                      </Container>
                    </div>
                  </div>
                ) : null}
              </Row>
              <Row>
                {recipient.tabs.signHereTabs &&
                recipient.tabs.signHereTabs.length > 0 ? (
                  <div>
                    Sign Here Tabs
                    <div className="my-2">
                      <Container
                        responsive="md"
                        // classes={{ root: classes.customTable }}
                        style={{
                          "& .MuiTableCell-sizeSmall": {
                            padding: "2px 2px",
                            border: "0.5px solid grey ",
                          },
                          width: "100%",
                          tableLayout: "fixed",
                          wordBreak: "break-word",
                          textOverflow: "scroll",
                        }}
                        size="small"
                      >
                        <Row>
                          <Col>Anchor String</Col>
                          <Col>Units</Col>
                          <Col>X OffSet</Col>
                          <Col>Y Offset</Col>
                        </Row>

                        {recipient.tabs.signHereTabs.map((signHereTab, i) => (
                          <Row key={i}>
                            <Col>
                              <input
                                type="text"
                                className="form-control"
                                name="anchorString"
                                value={signHereTab.anchorString}
                                onChange={(e) =>
                                  handleChangeSignHereTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                type="text"
                                className="form-control"
                                name="anchorUnits"
                                value={signHereTab.anchorUnits}
                                onChange={(e) =>
                                  handleChangeSignHereTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                className="form-control"
                                name="anchorXOffset"
                                value={signHereTab.anchorXOffset}
                                onChange={(e) =>
                                  handleChangeSignHereTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                className="form-control"
                                name="anchorYOffset"
                                value={signHereTab.anchorYOffset}
                                onChange={(e) =>
                                  handleChangeSignHereTabs(idx, e, i)
                                }
                              />
                            </Col>
                          </Row>
                        ))}
                      </Container>
                    </div>
                  </div>
                ) : null}
              </Row>
              <Row>
                {recipient.tabs.textTabs &&
                recipient.tabs.textTabs.length > 0 ? (
                  <div>
                    Text Tabs{" "}
                    <div className="my-2">
                      <Container
                        responsive="md"
                        // classes={{ root: classes.customTable }}
                        style={{
                          "& .MuiTableCell-sizeSmall": {
                            padding: "2px 2px",
                            border: "0.5px solid grey ",
                          },
                          width: "100%",
                          tableLayout: "fixed",
                          wordBreak: "break-word",
                          textOverflow: "scroll",
                        }}
                        size="small"
                      >
                        <Row>
                          <Col>Anchor String</Col>
                          <Col>Units</Col>
                          <Col>X OffSet</Col>
                          <Col>Y Offset</Col>
                        </Row>

                        {recipient.tabs.textTabs.map((textTab, i) => (
                          <Row key={i}>
                            <Col>
                              <input
                                type="text"
                                className="form-control"
                                name="anchorString"
                                value={textTab.anchorString}
                                onChange={(e) =>
                                  handleChangeTextTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                type="text"
                                className="form-control"
                                name="anchorUnits"
                                value={textTab.anchorUnits}
                                onChange={(e) =>
                                  handleChangeTextTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                className="form-control"
                                name="anchorXOffset"
                                value={textTab.anchorXOffset}
                                onChange={(e) =>
                                  handleChangeTextTabs(idx, e, i)
                                }
                              />
                            </Col>
                            <Col>
                              <input
                                className="form-control"
                                name="anchorYOffset"
                                value={textTab.anchorYOffset}
                                onChange={(e) =>
                                  handleChangeTextTabs(idx, e, i)
                                }
                              />
                            </Col>
                          </Row>
                        ))}
                      </Container>
                    </div>
                  </div>
                ) : null}
              </Row>
              <Row>
                {recipient.tabs.initialHereTabs &&
                recipient.tabs.initialHereTabs.length > 0 ? (
                  <div>
                    Sign Here Tabs
                    <div className="my-2">
                      <Container
                        responsive="md"
                        // classes={{ root: classes.customTable }}
                        style={{
                          "& .MuiTableCell-sizeSmall": {
                            padding: "2px 2px",
                            border: "0.5px solid grey ",
                          },
                          width: "100%",
                          tableLayout: "fixed",
                          wordBreak: "break-word",
                          textOverflow: "scroll",
                        }}
                        size="small"
                      >
                        <Row>
                          <Col>Anchor String</Col>
                          <Col>Units</Col>
                          <Col>X OffSet</Col>
                          <Col>Y Offset</Col>
                        </Row>

                        {recipient.tabs.initialHereTabs.map(
                          (initialHereTab, i) => (
                            <Row key={i}>
                              <Col>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="anchorString"
                                  value={initialHereTab.anchorString}
                                  onChange={(e) =>
                                    handleChangeInitialHereTabs(idx, e, i)
                                  }
                                />
                              </Col>
                              <Col>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="anchorUnits"
                                  value={initialHereTab.anchorUnits}
                                  onChange={(e) =>
                                    handleChangeInitialHereTabs(idx, e, i)
                                  }
                                />
                              </Col>
                              <Col>
                                <input
                                  className="form-control"
                                  name="anchorXOffset"
                                  value={initialHereTab.anchorXOffset}
                                  onChange={(e) =>
                                    handleChangeInitialHereTabs(idx, e, i)
                                  }
                                />
                              </Col>
                              <Col>
                                <input
                                  className="form-control"
                                  name="anchorYOffset"
                                  value={initialHereTab.anchorYOffset}
                                  onChange={(e) =>
                                    handleChangeInitialHereTabs(idx, e, i)
                                  }
                                />
                              </Col>
                            </Row>
                          )
                        )}
                      </Container>
                    </div>
                  </div>
                ) : null}
              </Row>
            </Row>
          ))}
        </Container>
      </div>
    );
  }
  function handleChangeRecipients(i, event) {
    const fields = [...recipients];
    fields[i][event.target.name] = event.target.value;
    setRecipients(fields);
  }
  // Convert file to base64 string
  const getBase64 = async (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  const addFile = (e) => {
    const file = e.target.files[0];
    var base = getBase64(file).then(function (result) {
      setNewFile(result.split(["base64,"][1]));
    });
  };

  const randomNounce = async () => {
    try {
      const url =
        "https://www.random.org/strings/?num=1&len=20&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new";
      let results = await fetch(url, {
        mode: "cors",
        headers: new Headers({
          Accept: `text/html`,
        }),
      });
      if (results && results.ok) {
        // remove the last character, a CR
        return (await results.text()).slice(0, -1);
      }
    } catch (e) {}
    return false;
  };

  /*
   * Create a data URL, then strip the extra stuff to leave just
   * the content with BASE64 encoding
   */
  async function blobToBase64(blob) {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };
    });
  }
  console.log(at, accessToken);
  // // returns true for success, false for a problem (see .errMsg)
  async function getUserInfo() {
    let userInfoResponse;
    try {
      userInfoResponse = await fetchUserInfo();
    } catch (e) {
      return false;
    }
    if (!userInfoResponse || !userInfoResponse.ok) {
      return false;
    }

    const userInfoObj = await userInfoResponse.json();
    userInfoResponse = userInfoObj;

    accounts = userInfoObj.accounts.map((a) => ({
      accountId: a.account_id,
      accountExternalId: null,
      accountName: a.account_name,
      accountIsDefault: a.is_default,
      accountBaseUrl: a.base_uri + eSignBase,
      corsError: false,
    }));

    await fetchExternalAccountIds();
    accounts.forEach((a, i) => {
      if (a.accountIsDefault) {
        defaultAccountIndex = i;
      }
    });
    data.userInfo = userInfoObj;

    data.userInfo.defaultAccount = accounts[defaultAccountIndex].accountId;
    data.userInfo.defaultAccountName =
      accounts[defaultAccountIndex].accountName;
    data.userInfo.defaultBaseUrl = accounts[defaultAccountIndex].accountBaseUrl;
    data.userInfo.accessToken = at;
    return true;
  }

  /*
   * fetchExternalAccountIds
   * If an account doesn't support CORS from this client ID, then the external
   * account lookup will fail.
   *
   * External account IDs are used in the Switch Account modal.
   */
  async function fetchExternalAccountIds() {
    for (const account of accounts) {
      try {
        const url = `${account.accountBaseUrl}/accounts/${account.accountId}`;
        const response = await fetch(url, {
          mode: "cors",
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${at}`,
            Accept: `application/json`,
            "X-DocuSign-SDK": "CodePen",
          }),
        });
        const data = response && response.ok && (await response.json());
        account.accountExternalId = data.externalAccountId;
      } catch (e) {
        account.corsError = e instanceof TypeError;
      }
    }
  }
  /*
   * CORS request to userInfo API method
   */
  const fetchUserInfo = async () => {
    return fetch(`${oAuthServiceProvider}${userInfoPath}`, {
      mode: "cors",
      headers: new Headers({
        Authorization: `Bearer ${at}`,
        Accept: `application/json`,
        "X-DocuSign-SDK": "CodePen",
      }),
    });
  };
  const login = async () => {
    _nonce = Date.now(); // default nounce
    _nonce = (await randomNounce()) || _nonce;
    const url =
      `${oAuthServiceProvider}${implicitGrantPath}` +
      `?response_type=token` +
      `&scope=${oAuthScopes}` +
      `&client_id=${oAuthClientID}` +
      `&redirect_uri=${oAuthReturnUrl}` +
      `&state=${_nonce}`;
    _loginWindow = window.open(url, "_blank");
    let newTab = _loginWindow;
    if (!newTab || newTab.closed || typeof newTab.closed == "undefined") {
      // POPUP BLOCKED
      alert("Please enable the popup login window. Then reload this page.");
    }
    console.log("before addeventlistener ");
    _loginWindow.addEventListener("message", messageListener);

    _loginWindow.focus();
  };
  function handleMessage(data) {
    console.log("in handlemessage", data);
    if (!data || data.source !== "oauthResponse") {
      console.log("skip");
      return "skip";
    }
    console.log("in handlemessage", data.source);
    // OAuth response
    if (_loginWindow) {
      _loginWindow.close(); // close the browser tab used for OAuth
    }
    const hash = data.hash.substring(1); // remove the #

    const items = hash.split(/\=|\&/);
    let i = 0;
    let response = {};
    while (i + 1 < items.length) {
      response[items[i]] = items[i + 1];
      i += 2;
    }
    const newState = response.state;
    if (newState !== _nonce) {
      return "error";
    }
    at = response.access_token;
    setAccessToken(response.access_token);
    setAccessTokenExpires(new Date(Date.now() + response.expires_in * 1000));
    // done!

    return "ok";
  }

  let messageListener = async function messageListenerf(event) {
    console.log("in messagelistener", event);
    console.log("here");
    if (!event.data) {
      return;
    }
    const source = event.data.source;
    console.log("in messagelistener source", source);
    if (source === "dsResponse") {
      console.log("in dsresponse");
      //  signingCeremonyEnded(event.data);
      return;
    }
    if (source === "oauthResponse") {
      console.log("in messagelistener implicitgrant", event.data);
      await implicitGrantMsg(event.data);
      return;
    }
  };
  //   messageListener = messageListener.bind(this);
  /*
   * Process incoming implicit grant response
   */
  const implicitGrantMsg = async (eventData) => {
    console.log("in implicitgrantmsg", eventData);
    let oAuthResponse = handleMessage(eventData);
    console.log("in implicitgrantmsg oauth", oAuthResponse);
    if (oAuthResponse === "ok") {
      if (await completeLogin()) {
        console.log("in if completelogin");
        data.loggedIn();
      }
    } else if (oAuthResponse === "error") {
    }
  };

  /*
   * Complete login process including
   * Get user information
   * Set up CallApi object
   * update the user
   */
  async function completeLogin() {
    console.log("in complete login", data);
    const ok = await getUserInfo();
    if (ok) {
      if (logLevel === 0) {
        setUserInfo(data.userInfo);
      } else {
        setUserInfo(data.userInfo);
      }
    } else {
    }
    console.log(data);
    setDefaultAccount(data.userInfo.defaultAccount);
    setApiBaseUrl(data.userInfo.defaultBaseUrl);
    return ok;
  }
  function openInNewTab(e, url) {
    e.preventDefault();
    var win = window.open(url, "_blank");
    win.focus();
  }
  function checkToken() {
    const bufferTime = 15 * 60 * 1000;
    const ok =
      accessToken &&
      accessTokenExpires &&
      Date.now() + bufferTime < accessTokenExpires.getTime();
    return ok;
  }

  /*
   * GET a document from a CORS source and return it as a string
   * with BASE64 encoding.
   */
  async function getDocB64(docUrl) {
    try {
      let results = await fetch(docUrl, {
        mode: "cors",
        headers: new Headers({
          Accept: `*/*`,
        }),
      });
      if (results && results.ok) {
        const doc = await results.blob().then(blobToBase64);
        return doc;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  async function callApiJson({ apiMethod, httpMethod, req, qp }) {
    console.log("in callapijson");
    let body = null;
    if (httpMethod === "POST" || httpMethod === "PUT") {
      body = JSON.stringify(req, null, 4);
    }

    try {
      let headers = new Headers({
        Accept: `application/json`,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-DocuSign-SDK": "CodePen v2",
      });

      let url = `${apiBaseUrl}${apiMethod}`;
      console.log("in callapijson", url);
      if (qp) {
        url += "?" + new URLSearchParams(qp);
      }
      let results = await fetch(url, {
        method: httpMethod,
        mode: "cors",
        headers: headers,
        body: body,
      });
      console.log("in callapijson", results);
      if (results && results.ok) {
        return await results.json();
      } else {
        const res = await results.text();

        return false;
      }
    } catch (e) {
      return false;
    }
  }
  /*
   *  Create the envelope by completely specifying the envelope.
   *  Often the recommended alternative is to first create a template
   *  on the DocuSign platform, then reference the template when
   *  creating the envelope. See the other examples...
   */
  async function createEnvelope(signer) {
    const docB64 = await getDocB64(docUrl); // fetch a document
    console.log("in createEnvelope");
    const f = newFile[0].split(["base64,"][1]);
    const req = {
      emailSubject: subject,
      status: "sent",

      documents: [
        {
          name: documentName,
          documentBase64: newFile[0].split("base64,")[1],
          // documentBase64: docB64,
          fileExtension: "pdf",
          documentId: "1",
        },
      ],
      recipients: {
        signers: signer,
      },
    };
    console.log(req);
    // Make the create envelope API call
    console.log(`Creating envelope.`, defaultAccount);
    const apiMethod = `/accounts/${defaultAccount}/envelopes`;
    const httpMethod = "POST";
    const results = await callApiJson({
      apiMethod: apiMethod,
      httpMethod: httpMethod,
      req: req,
    });

    if (results === false) {
      return false;
    }

    localStorage.setItem("envelopeId", results.envelopeId);
    return results.envelopeId;
  }

  async function getRecipients(envelopeId) {
    console.log(`Getting envelope details.`, envelopeId);
    const apiMethod = `/accounts/${defaultAccount}/envelopes/${envelopeId}/recipients`;
    const httpMethod = "GET";
    const results = await callApiJson({
      apiMethod: apiMethod,
      httpMethod: httpMethod,
      // req: req,
    });

    if (results === false) {
      return false;
    }

    // localStorage.setItem("envelope", results);
    return results;
  }

  /*
   * Create an embedded signing ceremony, open a new tab with it
   */
  async function embeddedSigningCeremony({ envelopeId, signer }) {
    const req = {
      returnUrl: dsReturnUrl,
      authenticationMethod: "None",
      clientUserId: signer.clientUserId,
      email: signer.email,
      userName: signer.name,
    };

    // Make the API call
    const apiMethod = `/accounts/${data.userInfo.defaultAccount}/envelopes/${envelopeId}/views/recipient`;
    const httpMethod = "POST";
    const results = await callApiJson({
      apiMethod: apiMethod,
      httpMethod: httpMethod,
      req: req,
    });
    if (results === false) {
      return false;
    }

    console.log(`Displaying signing ceremony...`);
    signingCeremonyWindow = window.open(results.url, "_blank");
    if (
      !signingCeremonyWindow ||
      signingCeremonyWindow.closed ||
      typeof signingCeremonyWindow.closed == "undefined"
    ) {
      // popup blocked
      alert("Please enable the popup window signing ceremony");
    }
    signingCeremonyWindow.focus();
    return true;
  }
  /*
   * The doit function is the example that is triggered by the
   * Button. The user is already logged in (we have an access token).
   */

  const doit = async () => {
    console.log("in do it");
    const signer = recipients;
    console.log(signer);
    const envelopeId = await createEnvelope(signer);
    if (envelopeId) {
      console.log(`Envelope ${envelopeId} created.`);
      const envelopeRecipients = await getRecipients(envelopeId);
      setEnvelopeDetails(envelopeRecipients.signers);
      setShowEnvelopeDetails(true);
    }
    setShowAddRecipients(false);
  };

  return (
    <div>
      <Row className="m-5">
        <Col></Col>
        <Col>
          {" "}
          <Button
            style={{
              backgroundColor: "#07ad9f",
              border: "none",
              color: "white",
            }}
            type="Button"
            onClick={() => {
              login();
            }}
          >
            Login to DocuSign
          </Button>
        </Col>
        {showUserDetails ? (
          <Col style={{ color: "#07ad9f", fontWeight: "700" }}>
            {userInfo.name} <br />
            {userInfo.email}
            <br />
            {userInfo.defaultAccountName}{" "}
          </Col>
        ) : (
          <Col></Col>
        )}
      </Row>
      {showAddRecipients ? (
        <Row className=" m-5 p-3" style={{ border: "1px solid black" }}>
          <Row>
            <Col className="mx-2 my-3">
              Email Subject
              <input
                type="text"
                className="form-control"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </Col>
            <Col></Col>
            <Col></Col>
          </Row>
          <Row>
            <Table
              className="m-3"
              responsive="md"
              // classes={{ root: classes.customTableDocuments }}
              style={{
                "& .MuiTableCell-sizeSmall": {
                  padding: "5px",
                  border: "0.5px solid grey ",
                },
                width: "100%",
                tableLayout: "fixed",
                wordBreak: "break-word",
                textOverflow: "scroll",
              }}
              size="small"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Upload</TableCell>
                  <TableCell>Document Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {" "}
                <TableRow>
                  <TableCell>
                    <div>
                      <input
                        id="file"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={addFile}
                        className="d-none"
                      />
                      <label htmlFor="file">
                        <Button
                          variant="outline-primary"
                          style={{
                            backgroundColor: "#07ad9f",
                            border: "none",
                            color: "white",
                          }}
                          as="p"
                        >
                          Add Document
                        </Button>
                      </label>
                    </div>
                  </TableCell>

                  <TableCell>
                    {" "}
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Row>
          <Row id="msg">
            <Col className="mx-2 my-3" xs={2}>
              {" "}
              Recipients
            </Col>
            <Col className="mx-2 my-3">
              <img
                src={AddIcon}
                alt="Add Icon"
                onClick={() => {
                  handleAddRecipients();
                }}
                style={{
                  width: "15px",
                  height: "15px",
                  float: "left",
                  marginRight: "5rem",
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col className="mx-2 my-3">
              {" "}
              {recipients && recipients.length > 0 ? (
                <div>{addRecipients()}</div>
              ) : null}
            </Col>
          </Row>
          <Row>
            <Col className="mx-2 my-3">
              {" "}
              <label>Send for owner to sign &nbsp;</label>
              <input
                type="checkbox"
                onClick={() => handleAddOwnerToRecipients()}
              />
            </Col>
            <Col className="mx-2 my-3"></Col>
            <Col className="mx-2 my-3"></Col>
          </Row>

          <Row>
            {" "}
            <Col></Col>
            <Col className="mx-2 my-3">
              {" "}
              <Button
                style={{
                  backgroundColor: "#07ad9f",
                  border: "none",
                  color: "white",
                }}
                id="btnDoit"
                onClick={() => {
                  doit(defaultAccount);
                }}
              >
                Send and Sign an Envelope
              </Button>
            </Col>
            <Col> </Col>
          </Row>
        </Row>
      ) : (
        ""
      )}
      {showEnvelopeDetails ? (
        <Row className="m-5 p-3" style={{ border: "1px solid black" }}>
          Recipients
          <Table
            responsive="md"
            // classes={{ root: classes.customTableDocuments }}s
            style={{
              "& .MuiTableCell-sizeSmall": {
                padding: "5px",
                border: "0.5px solid grey ",
              },
              width: "100%",
              tableLayout: "fixed",
              wordBreak: "break-word",
              textOverflow: "scroll",
            }}
            size="small"
          >
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {envelopeDetails.length > 0
                ? envelopeDetails.map((signer) => {
                    return (
                      <TableRow>
                        <TableCell>{signer.recipientId}</TableCell>
                        <TableCell>{signer.name}</TableCell>
                        <TableCell>{signer.email}</TableCell>
                        <TableCell>{signer.status}</TableCell>
                      </TableRow>
                    );
                  })
                : ""}
            </TableBody>
          </Table>
          <Button
            style={{
              backgroundColor: "#07ad9f",
              border: "none",
              color: "white",
            }}
            type="Button"
            onClick={() => {
              setShowAddRecipients(true);
              setShowEnvelopeDetails(false);
              setRecipients([]);
              setSubject([]);
              setDocumentName([]);
              setNewFile([]);
            }}
          >
            Send Another Envelope
          </Button>
        </Row>
      ) : (
        ""
      )}
    </div>
  );
}
