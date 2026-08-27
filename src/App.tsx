import NeuralNetworkAnimation from './components/NeuralNetworkAnimation';
import ChatBot from './components/ChatBot';
import './App.css'

function App() {
  return (
    <>
      <NeuralNetworkAnimation />
      <section id="center" className="chat-section">
        <ChatBot />
      </section>
    </>
  );
}

export default App
