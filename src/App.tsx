import './App.css'
import Button from './components/atoms/button'
import InputField from './components/atoms/InputField'


function App() {

  return (
    <>
      <div className="div">
        <InputField placeholder="Enter text" />
        <Button onClick={() => alert('Button clicked!')}>
          Submit
        </Button>
      </div>
    </>
  )
}

export default App
