// DOM Elements
const chatbotContainer = document.getElementById('chatbot');
const chatbotBubble = document.getElementById('chatbot-bubble');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotMessages = document.getElementById('chatbot-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// API Configuration
const API_KEY = 'ddc-a4f-b6b0cdaee61c48a5af05b16ae38d4025';
const API_URL = 'https://api.a4f.co/v1/chat/completions';
const MODEL = 'provider-2/gpt-3.5-turbo';

// Chatbot State
let isChatbotOpen = false;

// Initialize the chatbot
document.addEventListener('DOMContentLoaded', () => {
    // Show chatbot bubble
    chatbotBubble.addEventListener('click', toggleChatbot);
    
    // Toggle chatbot minimize/maximize
    chatbotToggle.addEventListener('click', toggleChatbot);
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Toggle chatbot visibility
function toggleChatbot() {
    isChatbotOpen = !isChatbotOpen;
    
    if (isChatbotOpen) {
        chatbotContainer.style.display = 'block';
        chatbotToggle.innerHTML = '<i class="fas fa-minus"></i>';
        // Focus on input field when chatbot opens
        setTimeout(() => userInput.focus(), 300);
    } else {
        chatbotContainer.style.display = 'none';
        chatbotToggle.innerHTML = '<i class="fas fa-plus"></i>';
    }
}

// Send user message to API
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input field
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Call API and get response
        const reply = await callA4FAPI(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response to chat
        addMessageToChat('bot', reply);
        
        // Scroll to bottom of chat
        scrollToBottom();
    } catch (error) {
        console.error('Error calling API:', error);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Show error message
        addMessageToChat('bot', 'Sorry, I encountered an error. Please try again later.');
        
        // Scroll to bottom of chat
        scrollToBottom();
    }
}

// Add message to chat window
function addMessageToChat(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message;
    
    messageContent.appendChild(messageParagraph);
    messageDiv.appendChild(messageContent);
    chatbotMessages.appendChild(messageDiv);
    
    // Scroll to bottom of chat
    scrollToBottom();
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    
    const typingContent = document.createElement('div');
    typingContent.classList.add('message-content');
    
    const typingDots = document.createElement('div');
    typingDots.classList.add('typing-dots');
    typingDots.innerHTML = '<span></span><span></span><span></span>';
    
    typingContent.appendChild(typingDots);
    typingDiv.appendChild(typingContent);
    chatbotMessages.appendChild(typingDiv);
    
    // Scroll to bottom of chat
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Call A4F API
async function callA4FAPI(userMessage) {
    try {
        // Add Zenher context to enhance responses
        const enhancedMessage = addZenherContext(userMessage);
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "user", content: enhancedMessage }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        console.log("AI reply:", reply);
        return reply;
    } catch (error) {
        console.error("Error calling A4F API:", error);
        throw error;
    }
}

// Add Zenher context to user message
function addZenherContext(userMessage) {
    // Check if message is related to women's health topics
    const womensHealthKeywords = ['period', 'menstrual', 'cycle', 'ovulation', 'pregnancy', 'PCOS', 'PCOD', 'fertility'];
    const mentalHealthKeywords = ['stress', 'anxiety', 'depression', 'mental health', 'trauma', 'therapy'];
    const wellnessKeywords = ['wellness', 'nutrition', 'fitness', 'diet', 'exercise', 'sleep'];
    
    let contextPrompt = '';
    
    // Check for women's health topics
    if (womensHealthKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
        contextPrompt = "As Zenher's AI health assistant focused on women's health: ";
    }
    // Check for mental health topics
    else if (mentalHealthKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
        contextPrompt = "As Zenher's AI health assistant focused on mental wellness: ";
    }
    // Check for general wellness topics
    else if (wellnessKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
        contextPrompt = "As Zenher's AI health assistant focused on holistic wellness: ";
    }
    // Default context
    else {
        contextPrompt = "As Zenher's AI health assistant providing personalized insights: ";
    }
    
    return contextPrompt + userMessage;
}

// Add CSS for typing indicator
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 5px 10px;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            background-color: #8a4fff;
            border-radius: 50%;
            display: inline-block;
            opacity: 0.6;
            animation: typing-dot 1.4s infinite ease-in-out both;
        }
        
        .typing-dots span:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .typing-dots span:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes typing-dot {
            0%, 80%, 100% { transform: scale(0.6); }
            40% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // Open chatbot by default after a short delay
    setTimeout(() => {
        if (!isChatbotOpen) {
            toggleChatbot();
        }
    }, 2000);
});

// Create Zenher logo SVG
document.addEventListener('DOMContentLoaded', () => {
    // Create logo SVG
    createZenherLogo();
    
    // Create icon SVG
    createZenherIcon();
    
    // Create avatar SVG
    createAvatarSVG();
    
    // Create placeholder SVGs for article images
    createMenstrualCycleSVG();
    createMentalHealthSVG();
    createPCOSSVG();
});

// Create Zenher logo SVG
function createZenherLogo() {
    const logoSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    logoSVG.setAttribute('width', '120');
    logoSVG.setAttribute('height', '40');
    logoSVG.setAttribute('viewBox', '0 0 120 40');
    logoSVG.setAttribute('fill', 'none');
    
    // Create gradient
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'zenher-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#e94caf');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#8a4fff');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    
    // Create logo path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M10,20 C10,13.5 15.5,8 22,8 C28.5,8 34,13.5 34,20 C34,26.5 28.5,32 22,32 C15.5,32 10,26.5 10,20 Z M22,15 L22,25 M17,20 L27,20');
    path.setAttribute('stroke', 'url(#zenher-gradient)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-linecap', 'round');
    
    // Create text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '40');
    text.setAttribute('y', '25');
    text.setAttribute('fill', '#333');
    text.setAttribute('font-family', 'Segoe UI, sans-serif');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '18');
    text.textContent = 'Zenher';
    
    // Add elements to SVG
    logoSVG.appendChild(gradient);
    logoSVG.appendChild(path);
    logoSVG.appendChild(text);
    
    // Save SVG to file
    const logoContainer = document.querySelector('.logo');
    if (logoContainer) {
        logoContainer.innerHTML = '';
        logoContainer.appendChild(logoSVG);
    }
    
    // Also update footer logo
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo && footerLogo.querySelector('img')) {
        const footerLogoSVG = logoSVG.cloneNode(true);
        footerLogo.replaceChild(footerLogoSVG, footerLogo.querySelector('img'));
    }
}

// Create Zenher icon SVG
function createZenherIcon() {
    const iconSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSVG.setAttribute('width', '30');
    iconSVG.setAttribute('height', '30');
    iconSVG.setAttribute('viewBox', '0 0 30 30');
    iconSVG.setAttribute('fill', 'none');
    
    // Create gradient
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'zenher-icon-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#e94caf');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#8a4fff');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    
    // Create icon path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5,15 C5,9.5 9.5,5 15,5 C20.5,5 25,9.5 25,15 C25,20.5 20.5,25 15,25 C9.5,25 5,20.5 5,15 Z M15,10 L15,20 M10,15 L20,15');
    path.setAttribute('stroke', 'url(#zenher-icon-gradient)');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-linecap', 'round');
    
    // Add elements to SVG
    iconSVG.appendChild(gradient);
    iconSVG.appendChild(path);
    
    // Save SVG to file
    const iconContainer = document.querySelector('.chatbot-title img');
    if (iconContainer) {
        iconContainer.replaceWith(iconSVG);
    }
}

// Create avatar SVG
function createAvatarSVG() {
    const avatarSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    avatarSVG.setAttribute('width', '50');
    avatarSVG.setAttribute('height', '50');
    avatarSVG.setAttribute('viewBox', '0 0 50 50');
    avatarSVG.setAttribute('fill', 'none');
    
    // Create background circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '25');
    circle.setAttribute('cy', '25');
    circle.setAttribute('r', '24');
    circle.setAttribute('fill', '#f0e6ff');
    circle.setAttribute('stroke', '#e94caf');
    circle.setAttribute('stroke-width', '2');
    
    // Create avatar silhouette
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', '25');
    head.setAttribute('cy', '20');
    head.setAttribute('r', '10');
    head.setAttribute('fill', '#8a4fff');
    
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('d', 'M25,30 C16,30 12,35 12,42 L38,42 C38,35 34,30 25,30 Z');
    body.setAttribute('fill', '#8a4fff');
    
    // Add elements to SVG
    avatarSVG.appendChild(circle);
    avatarSVG.appendChild(body);
    avatarSVG.appendChild(head);
    
    // Save SVG to file
    const avatarContainer = document.querySelector('.card-header img');
    if (avatarContainer) {
        avatarContainer.replaceWith(avatarSVG);
    }
}

// Create menstrual cycle SVG
function createMenstrualCycleSVG() {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '200');
    svgElement.setAttribute('viewBox', '0 0 300 200');
    svgElement.setAttribute('fill', 'none');
    
    // Create cycle diagram
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '150');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', '80');
    circle.setAttribute('stroke', '#8a4fff');
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('fill', '#f0e6ff');
    
    // Create phase markers
    for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * 2 * Math.PI;
        const x = 150 + 80 * Math.cos(angle);
        const y = 100 + 80 * Math.sin(angle);
        
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
        dot.setAttribute('r', '3');
        
        // Color code by phase
        if (i < 5) {
            dot.setAttribute('fill', '#e94caf'); // Menstruation
        } else if (i < 14) {
            dot.setAttribute('fill', '#8a4fff'); // Follicular
        } else if (i < 16) {
            dot.setAttribute('fill', '#00c2cb'); // Ovulation
        } else {
            dot.setAttribute('fill', '#9966cc'); // Luteal
        }
        
        svgElement.appendChild(dot);
    }
    
    // Add text labels
    const labels = [
        { text: 'Menstruation', x: 150, y: 30, color: '#e94caf' },
        { text: 'Follicular', x: 240, y: 100, color: '#8a4fff' },
        { text: 'Ovulation', x: 150, y: 170, color: '#00c2cb' },
        { text: 'Luteal', x: 60, y: 100, color: '#9966cc' }
    ];
    
    labels.forEach(label => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', label.x);
        text.setAttribute('y', label.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', label.color);
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = label.text;
        
        svgElement.appendChild(text);
    });
    
    // Add uterus icons
    const uterusLeft = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    uterusLeft.setAttribute('d', 'M30,50 C40,40 50,45 50,55 C50,65 40,70 30,65 C25,62 20,55 30,50 Z');
    uterusLeft.setAttribute('fill', '#ffcce6');
    uterusLeft.setAttribute('stroke', '#e94caf');
    uterusLeft.setAttribute('stroke-width', '1');
    
    const uterusRight = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    uterusRight.setAttribute('d', 'M270,50 C260,40 250,45 250,55 C250,65 260,70 270,65 C275,62 280,55 270,50 Z');
    uterusRight.setAttribute('fill', '#ffcce6');
    uterusRight.setAttribute('stroke', '#e94caf');
    uterusRight.setAttribute('stroke-width', '1');
    
    svgElement.appendChild(uterusLeft);
    svgElement.appendChild(uterusRight);
    
    // Replace the image in the first article card
    const menstrualCycleImg = document.querySelector('.article-card:nth-child(1) img');
    if (menstrualCycleImg) {
        menstrualCycleImg.replaceWith(svgElement);
    }
}

// Create mental health SVG
function createMentalHealthSVG() {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '200');
    svgElement.setAttribute('viewBox', '0 0 300 200');
    svgElement.setAttribute('fill', 'none');
    
    // Create background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', '300');
    background.setAttribute('height', '200');
    background.setAttribute('fill', '#f0e6ff');
    background.setAttribute('rx', '10');
    
    // Create person silhouette
    const person = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    person.setAttribute('d', 'M120,50 C120,40 130,30 140,30 C150,30 160,40 160,50 C160,60 150,70 140,70 C130,70 120,60 120,50 Z');
    person.setAttribute('fill', '#8a4fff');
    
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('d', 'M140,70 C120,70 100,90 100,120 C100,150 120,170 140,170 C160,170 180,150 180,120 C180,90 160,70 140,70 Z');
    body.setAttribute('fill', '#8a4fff');
    
    // Create plants
    const plant1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    plant1.setAttribute('d', 'M200,150 C210,140 220,145 225,155 C230,145 240,140 250,150 C240,160 230,165 225,170 C220,165 210,160 200,150 Z');
    plant1.setAttribute('fill', '#a0d6b4');
    
    const plant2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    plant2.setAttribute('d', 'M210,130 C220,120 230,125 235,135 C240,125 250,120 260,130 C250,140 240,145 235,150 C230,145 220,140 210,130 Z');
    plant2.setAttribute('fill', '#a0d6b4');
    
    const stem1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    stem1.setAttribute('d', 'M225,170 L225,190');
    stem1.setAttribute('stroke', '#a0d6b4');
    stem1.setAttribute('stroke-width', '2');
    
    const stem2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    stem2.setAttribute('d', 'M235,150 L235,190');
    stem2.setAttribute('stroke', '#a0d6b4');
    stem2.setAttribute('stroke-width', '2');
    
    // Add elements to SVG
    svgElement.appendChild(background);
    svgElement.appendChild(plant1);
    svgElement.appendChild(plant2);
    svgElement.appendChild(stem1);
    svgElement.appendChild(stem2);
    svgElement.appendChild(body);
    svgElement.appendChild(person);
    
    // Replace the image in the second article card
    const mentalHealthImg = document.querySelector('.article-card:nth-child(2) img');
    if (mentalHealthImg) {
        mentalHealthImg.replaceWith(svgElement);
    }
}

// Create PCOS SVG
function createPCOSSVG() {
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '200');
    svgElement.setAttribute('viewBox', '0 0 300 200');
    svgElement.setAttribute('fill', 'none');
    
    // Create background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '0');
    background.setAttribute('y', '0');
    background.setAttribute('width', '300');
    background.setAttribute('height', '200');
    background.setAttribute('fill', '#e6e0ff');
    background.setAttribute('rx', '10');
    
    // Create meditation figure
    const person = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    person.setAttribute('d', 'M150,70 C140,70 130,80 130,90 C130,100 140,110 150,110 C160,110 170,100 170,90 C170,80 160,70 150,70 Z');
    person.setAttribute('fill', '#ffffff');
    
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    body.setAttribute('d', 'M120,110 L130,130 L170,130 L180,110 Z');
    body.setAttribute('fill', '#ffffff');
    
    const legs = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    legs.setAttribute('d', 'M130,130 C120,140 120,150 130,160 L170,160 C180,150 180,140 170,130 Z');
    legs.setAttribute('fill', '#ffffff');
    
    // Create decorative elements
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('cx', '200');
    circle1.setAttribute('cy', '50');
    circle1.setAttribute('r', '15');
    circle1.setAttribute('fill', '#e94caf');
    circle1.setAttribute('opacity', '0.5');
    
    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle2.setAttribute('cx', '220');
    circle2.setAttribute('cy', '80');
    circle2.setAttribute('r', '10');
    circle2.setAttribute('fill', '#8a4fff');
    circle2.setAttribute('opacity', '0.5');
    
    const circle3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle3.setAttribute('cx', '80');
    circle3.setAttribute('cy', '60');
    circle3.setAttribute('r', '12');
    circle3.setAttribute('fill', '#8a4fff');
    circle3.setAttribute('opacity', '0.5');
    
    const circle4 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle4.setAttribute('cx', '50');
    circle4.setAttribute('cy', '90');
    circle4.setAttribute('r', '8');
    circle4.setAttribute('fill', '#e94caf');
    circle4.setAttribute('opacity', '0.5');
    
    // Create plant elements
    const leaf1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    leaf1.setAttribute('d', 'M230,150 C240,140 250,145 250,160 C250,175 240,180 230,170 C220,180 210,175 210,160 C210,145 220,140 230,150 Z');
    leaf1.setAttribute('fill', '#a0d6b4');
    
    const leaf2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    leaf2.setAttribute('d', 'M70,150 C80,140 90,145 90,160 C90,175 80,180 70,170 C60,180 50,175 50,160 C50,145 60,140 70,150 Z');
    leaf2.setAttribute('fill', '#a0d6b4');
    
    // Add notebook icons
    const notebook1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    notebook1.setAttribute('x', '240');
    notebook1.setAttribute('y', '120');
    notebook1.setAttribute('width', '20');
    notebook1.setAttribute('height', '25');
    notebook1.setAttribute('fill', '#ffffff');
    notebook1.setAttribute('stroke', '#8a4fff');
    notebook1.setAttribute('stroke-width', '1');
    
    const notebook2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    notebook2.setAttribute('x', '40');
    notebook2.setAttribute('y', '120');
    notebook2.setAttribute('width', '20');
    notebook2.setAttribute('height', '25');
    notebook2.setAttribute('fill', '#ffffff');
    notebook2.setAttribute('stroke', '#8a4fff');
    notebook2.setAttribute('stroke-width', '1');
    
    // Add lines to notebooks
    for (let i = 0; i < 4; i++) {
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '243');
        line1.setAttribute('y1', (125 + i * 5).toString());
        line1.setAttribute('x2', '257');
        line1.setAttribute('y2', (125 + i * 5).toString());
        line1.setAttribute('stroke', '#8a4fff');
        line1.setAttribute('stroke-width', '0.5');
        
        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '43');
        line2.setAttribute('y1', (125 + i * 5).toString());
        line2.setAttribute('x2', '57');
        line2.setAttribute('y2', (125 + i * 5).toString());
        line2.setAttribute('stroke', '#8a4fff');
        line2.setAttribute('stroke-width', '0.5');
        
        svgElement.appendChild(line1);
        svgElement.appendChild(line2);
    }
    
    // Add elements to SVG
    svgElement.appendChild(background);
    svgElement.appendChild(circle1);
    svgElement.appendChild(circle2);
    svgElement.appendChild(circle3);
    svgElement.appendChild(circle4);
    svgElement.appendChild(leaf1);
    svgElement.appendChild(leaf2);
    svgElement.appendChild(notebook1);
    svgElement.appendChild(notebook2);
    svgElement.appendChild(legs);
    svgElement.appendChild(body);
    svgElement.appendChild(person);
    
    // Replace the image in the third article card
    const pcosImg = document.querySelector('.article-card:nth-child(3) img');
    if (pcosImg) {
        pcosImg.replaceWith(svgElement);
    }
}
