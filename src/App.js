import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Container } from "react-bootstrap";
import DocuSignLogin from "./DocuSignLogin";
import ReturnPage from "./ReturnPage";
function App() {
  return (
    <Container className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DocuSignLogin />} />
          <Route path="/return-page" element={<ReturnPage />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

export default App;
