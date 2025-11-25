const API_URL = 'https://portfolio-backend-qxhg.onrender.com/api';

async function forceResumeUpdate() {
  console.log('Forcing resume data update...');
  
  try {
    const response = await fetch(`${API_URL}/force-resume-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    console.log('Force update result:', result);
    
    if (response.ok) {
      console.log('✅ Resume data force updated successfully');
      
      // Verify the update
      const resumeResponse = await fetch(`${API_URL}/resume/1`);
      const resumeData = await resumeResponse.json();
      console.log('Updated resume name:', resumeData.name);
      console.log('Updated resume profession:', resumeData.profession);
      console.log('Updated resume location:', resumeData.location);
    } else {
      console.error('❌ Force update failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Force update error:', error);
  }
}

forceResumeUpdate();