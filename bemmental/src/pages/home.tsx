import React from "react";
import meditando from "../assets/home 2.png";
import meditando3 from "../assets/home.png";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home: React.FC = () => (
  <>
    <div className="Header">
      <Header></Header>
    </div>

    <main className="home-main">
      <div className="home-content">
        <div className="home-images">
          <img src={meditando} alt="Pessoa Meditando" />
        </div>

        <div className="home-text">
          <div className="SuaMente"> 
            <h1>SUA MENTE REFLETE O SEU EU ATUAL, CUIDE DELA.</h1>
            <p>Cadastre-se gratuitamente e faça sua terapia sem sair de casa!</p>
          </div>
          
          <div className="PsicologoIdeal">
            <div className="meditando3">
              <img src={meditando3} alt="Terapia Sentada" />
            </div>
            <div className="PsicologoIdeal-content">
              <h2>ENCONTRE O PSICÓLOGO IDEAL!</h2>
              <p>
                Buscando um profissional que te entenda e deixe a conversa leve?
                Aqui você alinha o seu perfil ao do psicólogo!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <div className="Footer">
      <Footer></Footer>
    </div>
  </>
);

export default Home;
