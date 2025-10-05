#!/bin/bash

# Setup Ollama for n8n SEO Workflow
# Starts Ollama service and pulls required models

set -euo pipefail

echo "🤖 Setting up Ollama for SEO Workflow..."

# Start Ollama service
echo "Starting Ollama service..."
sudo systemctl start ollama
sleep 3

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama failed to start"
    exit 1
fi

echo "✅ Ollama service started"

# Pull required models
echo ""
echo "📥 Pulling required models..."

# Mistral 7B for content SEO analysis
if ! ollama list | grep -q "mistral:7b"; then
    echo "  Pulling mistral:7b (this may take a few minutes)..."
    ollama pull mistral:7b
    echo "  ✅ mistral:7b downloaded"
else
    echo "  ✅ mistral:7b already available"
fi

# Llama3.2 1B for keyword research
if ! ollama list | grep -q "llama3.2:1b"; then
    echo "  Pulling llama3.2:1b..."
    ollama pull llama3.2:1b
    echo "  ✅ llama3.2:1b downloaded"
else
    echo "  ✅ llama3.2:1b already available"
fi

# Test models
echo ""
echo "🧪 Testing models..."

# Test Mistral
MISTRAL_TEST=$(ollama run mistral:7b "Say 'OK' if you're working" 2>&1 | head -1)
if [[ "$MISTRAL_TEST" == *"OK"* ]] || [[ "$MISTRAL_TEST" == *"ok"* ]]; then
    echo "  ✅ Mistral 7B is responding"
else
    echo "  ⚠️  Mistral 7B response unclear: $MISTRAL_TEST"
fi

# Test Llama3.2
LLAMA_TEST=$(ollama run llama3.2:1b "Say 'OK' if you're working" 2>&1 | head -1)
if [[ "$LLAMA_TEST" == *"OK"* ]] || [[ "$LLAMA_TEST" == *"ok"* ]]; then
    echo "  ✅ Llama3.2 1B is responding"
else
    echo "  ⚠️  Llama3.2 1B response unclear: $LLAMA_TEST"
fi

# Enable Ollama to start on boot (optional)
read -p "Enable Ollama to start on boot? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo systemctl enable ollama
    echo "  ✅ Ollama will start on boot"
fi

echo ""
echo "✅ Ollama setup complete!"
echo ""
echo "Available models:"
ollama list

echo ""
echo "To test manually:"
echo "  ollama run mistral:7b 'Analyze this SEO content...'"
echo "  ollama run llama3.2:1b 'Suggest keywords for...'"
