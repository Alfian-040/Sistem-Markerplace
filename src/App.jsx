import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HeaderBelanja from "./components/layout/HeaderBelanja";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <Navbar />
      <HeaderBelanja />
      <main>
        <AppRoutes />
      </main>
      <Footer />
    </>
  );
}

export default App;