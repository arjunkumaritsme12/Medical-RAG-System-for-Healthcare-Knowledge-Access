import streamlit as st
import time
import random
import re

st.set_page_config(page_title="MedRAG AI", page_icon="🩺", layout="wide")

def inject_css():
    theme = st.session_state.get('app_theme', 'light')
    
    if theme == 'light':
        bg_color = "#f7f9fc"
        text_primary = "#0A2540"
        text_secondary = "#4A5568"
        card_bg = "rgba(255, 255, 255, 0.9)"
        border_color = "#e2e8f0"
        shadow = "0 8px 30px rgba(0, 0, 0, 0.05)"
        chip_bg = "#e6f2f0"
        sidebar_bg = "#ffffff"
    else:
        bg_color = "#0b1120"
        text_primary = "#f1f5f9"
        text_secondary = "#94a3b8"
        card_bg = "rgba(30, 41, 59, 0.7)"
        border_color = "#334155"
        shadow = "0 8px 30px rgba(0, 0, 0, 0.3)"
        chip_bg = "#1e293b"
        sidebar_bg = "#0f172a"

    css = f"""
    <style>
        /* Base styles */
        .stApp {{
            background-color: {bg_color};
            color: {text_primary};
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            transition: all 0.3s ease;
        }}
        
        .main .block-container {{
            max-width: 1000px;
            padding-top: 2rem;
            padding-bottom: 5rem;
        }}
        
        /* Headers */
        h1, h2, h3, h4, h5, h6 {{
            color: {text_primary} !important;
            font-weight: 700 !important;
            letter-spacing: -0.02em;
        }}
        
        .title-container {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid {border_color};
            animation: fadeInDown 0.8s ease-out;
        }}
        
        .title-text h1 {{
            font-size: 2.5rem;
            margin-bottom: 0.2rem;
            background: linear-gradient(135deg, {text_primary} 0%, #00BFA5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .title-sub {{
            color: {text_secondary};
            font-size: 1.1rem;
            font-weight: 400;
        }}
        
        .user-badge {{
            display: flex;
            align-items: center;
            gap: 12px;
            background: {card_bg};
            padding: 8px 16px;
            border-radius: 50px;
            box-shadow: {shadow};
            border: 1px solid {border_color};
            backdrop-filter: blur(10px);
        }}
        
        .avatar {{
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #00BFA5;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }}
        
        /* Input & Buttons */
        .stTextInput > div > div > input {{
            background-color: {card_bg} !important;
            color: {text_primary} !important;
            border: 2px solid {border_color} !important;
            border-radius: 16px !important;
            padding: 1rem 1.5rem !important;
            font-size: 1.1rem !important;
            box-shadow: {shadow} !important;
            transition: all 0.3s ease !important;
        }}
        
        .stTextInput > div > div > input:focus {{
            border-color: #00BFA5 !important;
            box-shadow: 0 0 0 3px rgba(0, 191, 165, 0.2), {shadow} !important;
        }}
