// Enhanced Zenher Women's Health Search Engine with Wikipedia Integration
// DOM Elements
const chatbotContainer = document.getElementById('chatbot');
const chatbotMessages = document.getElementById('chatbot-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// API Configuration - Updated with new settings
const API_KEY = 'ddc-a4f-f2ae8c8de2f9428bac844cd9b73c0ccb';
const API_URL = 'https://api.a4f.co/v1/chat/completions';
const MODEL = 'provider-3/gpt-4';

// Zenher Company Information for GPT-4 context
const ZENHER_CONTEXT = `
ZENHER COMPANY INFORMATION:
Zenher is a comprehensive women's health platform that empowers women every step of the way through their health journey. 

Company Details:
- Name: Zenher
- Website: https://www.zenher.in/
- Mission: To provide women with the tools, knowledge, and support they need to take control of their health and wellness

Core Services:
- Advanced menstrual cycle tracking with personalized insights and predictions
- Evidence-based health tips and educational content specifically for women's health
- Expert consultation services to connect with qualified healthcare professionals
- AI-powered personalized health insights based on individual health data
- Supportive community platform for women to share experiences and seek advice

Key Features:
- Comprehensive period tracking with symptom monitoring and cycle predictions
- Fertility and ovulation tracking for family planning purposes
- Various health symptom tracking including mood, energy levels, and physical symptoms
- Extensive library of women's health educational content and resources
- Direct access to healthcare professionals specializing in women's health
- Secure and private health data management with user control over personal information

Target Audience: Women of all ages seeking comprehensive health tracking, education, and expert guidance for their wellness journey.
`;

// Wikipedia Topics Mapping for Women's Health
const WIKIPEDIA_HEALTH_TOPICS = {
    zenher: {
        keywords: ['zenher', 'zen her', 'about zenher', 'what is zenher', 'zenher app', 'zenher platform', 'zenher services'],
        wikipediaPages: [
            'Women%27s_health',
            'Menstrual_cycle',
            'Reproductive_health',
            'Digital_health'
        ]
    },
    menstrualHealth: {
        keywords: ['menstrual', 'period', 'menstruation', 'cycle', 'pms', 'pmdd', 'cramps'],
        wikipediaPages: [
            'Menstrual_cycle',
            'Menstruation',
            'Premenstrual_syndrome',
            'Dysmenorrhea'
        ]
    },
    reproductiveHealth: {
        keywords: ['pregnancy', 'fertility', 'contraception', 'birth control', 'ovulation', 'conception'],
        wikipediaPages: [
            'Reproductive_health',
            'Pregnancy',
            'Birth_control',
            'Fertility'
        ]
    },
    gynecologicalHealth: {
        keywords: ['gynecology', 'pelvic', 'cervical', 'ovarian', 'uterine', 'vaginal', 'pap smear'],
        wikipediaPages: [
            'Gynaecology',
            'Cervical_cancer',
            'Ovarian_cancer',
            'Pap_test'
        ]
    },
    hormonalHealth: {
        keywords: ['hormones', 'estrogen', 'progesterone', 'menopause', 'perimenopause', 'pcos', 'endometriosis'],
        wikipediaPages: [
            'Polycystic_ovary_syndrome',
            'Endometriosis',
            'Menopause',
            'Estrogen'
        ]
    },
    maternalHealth: {
        keywords: ['maternal', 'pregnancy', 'prenatal', 'postpartum', 'breastfeeding', 'childbirth'],
        wikipediaPages: [
            'Maternal_health',
            'Prenatal_care',
            'Postpartum_period',
            'Breastfeeding'
        ]
    },
    mentalHealthWomen: {
        keywords: ['depression', 'anxiety', 'postpartum depression', 'mental health', 'stress', 'mood'],
        wikipediaPages: [
            'Postpartum_depression',
            'Women_and_mental_health',
            'Depression_in_women',
            'Anxiety_disorder'
        ]
    },
    breastHealth: {
        keywords: ['breast', 'mammogram', 'breast cancer', 'breastfeeding', 'breast exam'],
        wikipediaPages: [
            'Breast_cancer',
            'Mammography',
            'Breast_self-examination',
            'Breast_health'
        ]
    },
    sexualHealth: {
        keywords: ['sexual health', 'sti', 'std', 'hiv', 'sexual wellness', 'intimacy'],
        wikipediaPages: [
            'Sexual_health',
            'Sexually_transmitted_infection',
            'Women_and_HIV/AIDS',
            'Sexual_wellness'
        ]
    }
};

// Chatbot State
let citationCounter = 0;

// Initialize the chatbot
document.addEventListener('DOMContentLoaded', () => {
    initializeChatbot();
    addWelcomeMessage();
});

function initializeChatbot() {
    // Send message on button click
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Handle input changes to enable/disable send button
        userInput.addEventListener('input', handleInputChange);
        
        // Focus on input field when page loads
        setTimeout(() => {
            userInput.focus();
        }, 500);
    }
}

// Handle input changes for button state
function handleInputChange() {
    const message = userInput.value.trim();
    const sendButton = document.getElementById('send-button');
    
    if (message.length > 0) {
        sendButton.disabled = false;
    } else {
        sendButton.disabled = true;
    }
}

function addWelcomeMessage() {
    const welcomeMessage = `Hello! I'm ZENHER AI, your dedicated women's health assistant from Zenher. Committed to empowering your health journey, I provide personalized, evidence-based information and guidance on a wide range of women's health topics. All answers come with helpful resources for further reading. How can I assist you today?`;
    
    setTimeout(() => {
        addMessageToChat('bot', welcomeMessage, [], true);
    }, 1000);
}

// Enhanced send message function - now uses GPT-4 for all responses
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;
    
    // Disable send button during processing
    const sendButton = document.getElementById('send-button');
    sendButton.disabled = true;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input field
    userInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get enhanced response with Wikipedia links for all topics (including Zenher)
        const response = await getWomensHealthResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add bot response with Wikipedia link and Zenher website link
        addMessageToChat('bot', response.content, [], false, response.wikipediaLink, true);
        
    } catch (error) {
        console.error('Error getting response:', error);
        removeTypingIndicator();
        
        const errorMessage = "I apologize, but I am currently unable to access information. Please try again later, or feel free to ask me about Zenher's services and features.";
        addMessageToChat('bot', errorMessage, [], false, null, true);
    } finally {
        // Re-enable send button
        handleInputChange(); // This will properly set the button state based on input content
    }
}

// Enhanced A4F API call function
async function callA4FAPI(messages, maxTokens = 1000, temperature = 0.2) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: MODEL,
            messages: messages,
            max_tokens: maxTokens,
            temperature: temperature
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    return reply;
}

// Get most relevant Wikipedia page for the topic
function getWikipediaLink(userMessage) {
    const messageLower = userMessage.toLowerCase();
    
    // Find the most relevant topic
    for (const [topic, data] of Object.entries(WIKIPEDIA_HEALTH_TOPICS)) {
        if (data.keywords.some(keyword => messageLower.includes(keyword))) {
            // Return the most relevant Wikipedia page
            const relevantPage = data.wikipediaPages[0]; // Get the first (most relevant) page
            return {
                title: relevantPage.replace(/_/g, ' ').replace(/%27/g, "'"),
                url: `https://en.wikipedia.org/wiki/${relevantPage}`
            };
        }
    }
    
    // Default fallback for general women's health
    return {
        title: "Women's Health",
        url: "https://en.wikipedia.org/wiki/Women%27s_health"
    };
}

// Enhanced women's health response generation - now handles all queries including Zenher
async function getWomensHealthResponse(userMessage) {
    // Get relevant Wikipedia link
    const wikipediaLink = getWikipediaLink(userMessage);
    
    // Create enhanced prompt for women's health with Zenher context
    const enhancedPrompt = createWomensHealthPrompt(userMessage);
    
    try {
        const messages = [
            {
                role: 'system',
                content: enhancedPrompt.systemPrompt
            },
            {
                role: 'user',
                content: enhancedPrompt.userPrompt
            }
        ];

        const botResponse = await callA4FAPI(messages);
        
        // Clean and format the response professionally
        const cleanedResponse = cleanResponseText(botResponse);
        
        return {
            content: cleanedResponse,
            wikipediaLink: wikipediaLink
        };
        
    } catch (error) {
        console.error('API Error:', error);
        
        // Fallback response
        return {
            content: "I can provide you with comprehensive women's health information. Please rephrase your question for more specific guidance, or ask me about Zenher's services and features.",
            wikipediaLink: wikipediaLink
        };
    }
}

// Create women's health specific prompt with Zenher context
function createWomensHealthPrompt(userMessage) {
    const systemPrompt = `You are Zenher's Women's Health Search Engine, a professional medical information system specializing exclusively in women's health topics. 

${ZENHER_CONTEXT}

RESPONSE REQUIREMENTS:
1. Provide comprehensive, evidence-based women's health information
2. Use professional medical terminology appropriately
3. Structure responses in clear, flowing paragraphs without markdown formatting
4. Focus specifically on women's health concerns and conditions
5. Address gender-specific health considerations
6. Write in a professional, clinical tone suitable for healthcare education
7. Do not use headers, bullet points, asterisks, or any markdown symbols
8. Present information in well-structured paragraphs with smooth transitions
9. If the query is not related to women's health, redirect to women's health aspects
10. When users ask about Zenher, provide detailed information about our platform, services, and features based on the company information provided above
11. Naturally mention how Zenher's platform can support the user's health journey when relevant to their query
12. For Zenher-specific questions, be comprehensive about our services, mission, and how we empower women's health

Write responses as if they were from a professional medical reference, using proper paragraph structure and clinical language. When discussing Zenher, be informative and helpful about our platform's capabilities.`;

    const userPrompt = `User inquiry: ${userMessage}

Please provide a comprehensive, professionally written response. If this is about Zenher, provide detailed information about our platform, services, and features. If it's a women's health topic, provide evidence-based information and mention how Zenher can support their health journey when relevant. Structure your answer in clear paragraphs without any formatting symbols, headers, or bullet points.`;
    
    return { systemPrompt, userPrompt };
}

// Clean response text to remove all markdown and formatting
function cleanResponseText(text) {
    return text
        // Remove all markdown headers
        .replace(/#{1,6}\s+/g, '')
        // Remove bold and italic markdown
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // Remove bullet points and list formatting
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        // Remove extra line breaks and normalize spacing
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        // Ensure proper paragraph spacing
        .replace(/\n\n/g, '\n\n');
}

// Enhanced message display with Wikipedia link and Zenher website link
function addMessageToChat(sender, message, citations = [], isWelcome = false, wikipediaLink = null, includeZenherLink = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Create message text with professional formatting
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = formatProfessionalText(message);
    messageContent.appendChild(messageText);
    
    // Add Wikipedia link for bot messages (if provided)
    if (sender === 'bot' && wikipediaLink && !isWelcome) {
        const wikipediaSection = createWikipediaSection(wikipediaLink);
        messageContent.appendChild(wikipediaSection);
    }
    
    // Add Zenher website link for all bot responses (except welcome message)
    if (sender === 'bot' && includeZenherLink && !isWelcome) {
        const zenherSection = createZenherSection();
        messageContent.appendChild(zenherSection);
    }
    
    messageDiv.appendChild(messageContent);
    chatbotMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
}

// Create Wikipedia link section
function createWikipediaSection(wikipediaLink) {
    const wikipediaDiv = document.createElement('div');
    wikipediaDiv.className = 'wikipedia-section';
    
    const title = document.createElement('div');
    title.className = 'wikipedia-title';
    title.textContent = 'Additional Reading:';
    wikipediaDiv.appendChild(title);
    
    const linkElement = document.createElement('a');
    linkElement.href = wikipediaLink.url;
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.className = 'wikipedia-link';
    linkElement.textContent = wikipediaLink.title;
    
    wikipediaDiv.appendChild(linkElement);
    return wikipediaDiv;
}

// Create Zenher website link section
function createZenherSection() {
    const zenherDiv = document.createElement('div');
    zenherDiv.className = 'zenher-section';
    zenherDiv.style.cssText = `
        margin-top: 15px;
        padding: 12px;
        background: linear-gradient(135deg, #ff6b9d10, #c44569aa);
        border-radius: 8px;
        border-left: 3px solid #ff6b9d;
    `;
    
    const title = document.createElement('div');
    title.className = 'zenher-title';
    title.textContent = 'Learn More About Zenher:';
    title.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        color: #666;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    `;
    zenherDiv.appendChild(title);
    
    const linkElement = document.createElement('a');
    linkElement.href = 'https://www.zenher.in/';
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';
    linkElement.className = 'zenher-link';
    linkElement.textContent = 'Visit Zenher Platform - www.zenher.in';
    linkElement.style.cssText = `
        color: #ff6b9d;
        text-decoration: none;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.2s ease;
    `;
    
    linkElement.addEventListener('mouseover', () => {
        linkElement.style.color = '#c44569';
        linkElement.style.textDecoration = 'underline';
    });
    
    linkElement.addEventListener('mouseout', () => {
        linkElement.style.color = '#ff6b9d';
        linkElement.style.textDecoration = 'none';
    });
    
    zenherDiv.appendChild(linkElement);
    return zenherDiv;
}

// Format text professionally without markdown
function formatProfessionalText(text) {
    return text
        // Convert line breaks to proper paragraph breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, ' ')
        // Wrap in paragraph tags
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        // Clean up any empty paragraphs
        .replace(/<p>\s*<\/p>/g, '')
        // Ensure proper spacing
        .replace(/\s+/g, ' ')
        .trim();
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    
    const typingDots = document.createElement('div');
    typingDots.className = 'typing-dots';
    typingDots.innerHTML = '<span></span><span></span><span></span>';
    
    typingContent.appendChild(typingDots);
    typingDiv.appendChild(typingContent);
    chatbotMessages.appendChild(typingDiv);
    
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Scroll to bottom of messages
function scrollToBottom() {
    if (chatbotMessages) {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
}

// Handle window resize and orientation changes
function handleResize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    setTimeout(scrollToBottom, 100);
}

// Add resize event listeners
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
});

// Initial resize call
handleResize();