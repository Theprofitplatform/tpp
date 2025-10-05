import axios from 'axios';

const API_BASE = 'https://n8n.theprofitplatform.com.au/api/v1';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImF2aUB0aGVwcm9maXRwbGF0Zm9ybS5jb20uYXUiLCJwYXNzd29yZCI6bnVsbCwiZmlyc3ROYW1lIjoiQXZpIiwibGFzdE5hbWUiOiJHb2xkc3RlaW4iLCJpc1BlbmRpbmciOmZhbHNlLCJpc093bmVyIjp0cnVlLCJwZXJzb25hbGl6YXRpb25TdXJ2ZXkiOm51bGwsImdsb2JhbFNjb3BlcyI6WyJ1c2VyOmNyZWF0ZSIsInVzZXI6cmVhZCIsInVzZXI6dXBkYXRlIiwidXNlcjpkZWxldGUiLCJ1c2VyOmxpc3QiLCJjcmVkZW50aWFsO2NyZWF0ZSIsImNyZWRlbnRpYWw6cmVhZCIsImNyZWRlbnRpYWw6dXBkYXRlIiwiY3JlZGVudGlhbDpkZWxldGUiLCJjcmVkZW50aWFsOmxpc3QiLCJjcmVkZW50aWFsOnNoYXJlIiwidmFyaWFibGU6Y3JlYXRlIiwidmFyaWFibGU6cmVhZCIsInZhcmlhYmxlOnVwZGF0ZSIsInZhcmlhYmxlOmRlbGV0ZSIsInZhcmlhYmxlOmxpc3QiLCJzb3VyY2VDb250cm9sOnB1bGwiLCJzb3VyY2VDb250cm9sOnB1c2giLCJleHRlcm5hbFNlY3JldFN0b3JlOnJlZnJlc2giLCJvcmNoZXN0cmF0aW9uOmV4ZWN1dGUiLCJvcmNoZXN0cmF0aW9uOnJlYWQiLCJvcmNoZXN0cmF0aW9uOmxpc3QiLCJ3b3JrZmxvdzpjcmVhdGUiLCJ3b3JrZmxvdzpyZWFkIiwid29ya2Zsb3c6dXBkYXRlIiwid29ya2Zsb3c6ZGVsZXRlIiwid29ya2Zsb3c6bGlzdCIsIndvcmtmbG93OnNoYXJlIiwid29ya2Zsb3c6ZXhlY3V0ZSIsInRhZzpjcmVhdGUiLCJ0YWc6cmVhZCIsInRhZzp1cGRhdGUiLCJ0YWc6ZGVsZXRlIiwidGFnOmxpc3QiLCJ3b3JrZXJWaWV3Om1hbmFnZSIsImV4ZWN1dGlvbjpyZWFkIiwiZXhlY3V0aW9uOmxpc3QiLCJleGVjdXRpb246ZGVsZXRlIiwiZXhlY3V0aW9uOnJldHJ5Il0sImFwaUtleSI6ImY1ZGExM2YyOWJlMzQ5ODFhNDNjMTU2N2EwOTc4NjliIiwicm9sZXMiOlsiZ2xvYmFsOm93bmVyIl0sImlhdCI6MTcyNzA0MjkwMH0.Yw3T-tOdz-Q0NRJAGpQRSUxVfJhVLcE-Ksb8SbCuMJY';

async function getWorkflow() {
  try {
    const workflowId = 'fefa4ab2-72c7-4485-8356-e0eb7fd6a049';
    
    console.log('🔍 Fetching SEO workflow...');
    const response = await axios.get(`${API_BASE}/workflows/${workflowId}`, {
      headers: { 'X-N8N-API-KEY': API_TOKEN }
    });
    
    const workflow = response.data;
    console.log('\n✅ SEO Workflow Retrieved:');
    console.log('Name:', workflow.name);
    console.log('Active:', workflow.active);
    console.log('Nodes:', workflow.nodes?.length || 0);
    console.log('\n📋 Current Nodes:');
    workflow.nodes?.forEach((node, i) => {
      console.log(`${i + 1}. ${node.name} (${node.type})`);
    });
    
    // Save to file
    await import('fs').then(fs => {
      fs.promises.writeFile(
        'seo-workflow-original.json',
        JSON.stringify(workflow, null, 2)
      );
    });
    console.log('\n💾 Saved to: seo-workflow-original.json');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

getWorkflow();
