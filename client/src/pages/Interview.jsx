import { useState } from 'react';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';

function Interview() {
    const [step, setStep] = useState(1);
    const [interviewData, setInterviewData] = useState(null);
    
    console.log("Interview.jsx current step:", step);
    console.log("Interview.jsx interviewData:", interviewData);
    
  return (
    <div>

      {step === 1 && (
        <Step1 onStart={(data) => {
            console.log("Interview.jsx onStart called with data:", data);
            setInterviewData(data)
            setStep(2)
        }}  />
      )}

      {step === 2 && (
        
        <Step2 interviewData={interviewData} onFinish={(report) => {
          setInterviewData(report);
          setStep(3);
        }} />
      )}

      {step === 3 && (
        <Step3 report={interviewData} />
      )}

    </div>
  )
}

export default Interview
