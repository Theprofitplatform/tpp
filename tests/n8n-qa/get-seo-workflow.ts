import { N8nApiClient } from './src/lib/api.js';

const client = new N8nApiClient();

async function getWorkflow() {
  try {
    // SEO Optimization workflow ID
    const workflowId = 'fefa4ab2-72c7-4485-8356-e0eb7fd6a049';
    
    console.log('Fetching SEO workflow...');
    const response = await client.request('GET', `/workflows/${workflowId}`);
    
    if (response.data) {
      console.log('\n✅ SEO Workflow Retrieved:');
      console.log('Name:', response.data.name);
      console.log('Active:', response.data.active);
      console.log('Nodes:', response.data.nodes?.length || 0);
      console.log('\nWorkflow structure:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
  }
}

getWorkflow();
