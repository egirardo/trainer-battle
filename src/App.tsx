import './App.css'
import Button from './components/atoms/Button'


function App() {

  return (
    <>
      <div className="flex items-center justify-center gap-4">
        <Button onClick={() => alert('Button clicked!')}>
          Submit
        </Button>
      </div>
    </>
  )
}

export default App
