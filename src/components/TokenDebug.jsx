import React, { useState, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '../utils/tokenManager';

const TokenDebug = () => {
  const [tokenInfo, setTokenInfo] = useState({
    localStorage: null,
    sessionStorage: null,
    urlParams: null,
    tokenManager: null,
    decoded: null
  });

  const [testToken, setTestToken] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Default position
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const updateTokenInfo = () => {
    const localStorageToken = localStorage.getItem('token');
    const sessionStorageToken = sessionStorage.getItem('token');
    const urlParamsToken = new URLSearchParams(window.location.search).get('token');
    const tokenManagerToken = getToken();

    let decoded = null;
    if (tokenManagerToken) {
      try {
        const payload = JSON.parse(atob(tokenManagerToken.split('.')[1]));
        decoded = payload;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    setTokenInfo({
      localStorage: localStorageToken,
      sessionStorage: sessionStorageToken,
      urlParams: urlParamsToken,
      tokenManager: tokenManagerToken,
      decoded
    });
  };

  useEffect(() => {
    updateTokenInfo();
    
    // Update every 2 seconds
    const interval = setInterval(updateTokenInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveTestToken = () => {
    if (testToken) {
      saveToken(testToken);
      updateTokenInfo();
      setTestToken('');
    }
  };

  const handleRemoveToken = () => {
    removeToken();
    updateTokenInfo();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || '');
  };

  // Drag & Drop handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button, input')) return; // Don't drag when clicking buttons/inputs
    
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 400; // Component width
    const maxY = window.innerHeight - 100; // Component height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div 
      className="fixed bg-white rounded-lg shadow-lg border z-50 cursor-move"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header dengan button minimize */}
      <div className="flex items-center justify-between p-3 bg-primaryColor text-white rounded-t-lg">
        <h3 className="font-bold text-lg">🔑 Token Debug</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white/20"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Content - hanya tampil jika tidak minimized */}
      {!isMinimized && (
        <div className="p-4 max-w-md">
          
          {/* Quick Status Summary */}
          <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">Token Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                tokenInfo.tokenManager 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {tokenInfo.tokenManager ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="text-gray-600">
              {tokenInfo.tokenManager 
                ? `Valid until: ${tokenInfo.decoded ? new Date(tokenInfo.decoded.exp * 1000).toLocaleString() : 'Unknown'}`
                : 'No valid token found'
              }
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold">localStorage:</span>
              <div className="flex items-center gap-2">
                <span className={`${tokenInfo.localStorage ? 'text-green-600' : 'text-red-500'}`}>
                  {tokenInfo.localStorage ? '✅' : '❌'}
                </span>
                {tokenInfo.localStorage && (
                  <button 
                    onClick={() => copyToClipboard(tokenInfo.localStorage)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Copy localStorage token"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">sessionStorage:</span>
              <div className="flex items-center gap-2">
                <span className={`${tokenInfo.sessionStorage ? 'text-green-600' : 'text-red-500'}`}>
                  {tokenInfo.sessionStorage ? '✅' : '❌'}
                </span>
                {tokenInfo.sessionStorage && (
                  <button 
                    onClick={() => copyToClipboard(tokenInfo.sessionStorage)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Copy sessionStorage token"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">URL Params:</span>
              <div className="flex items-center gap-2">
                <span className={`${tokenInfo.urlParams ? 'text-green-600' : 'text-red-500'}`}>
                  {tokenInfo.urlParams ? '✅' : '❌'}
                </span>
                {tokenInfo.urlParams && (
                  <button 
                    onClick={() => copyToClipboard(tokenInfo.urlParams)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Copy URL params token"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Token Manager:</span>
              <div className="flex items-center gap-2">
                <span className={`${tokenInfo.tokenManager ? 'text-green-600' : 'text-red-500'}`}>
                  {tokenInfo.tokenManager ? '✅' : '❌'}
                </span>
                {tokenInfo.tokenManager && (
                  <button 
                    onClick={() => copyToClipboard(tokenInfo.tokenManager)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Copy token manager token"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
          </div>

          {tokenInfo.tokenManager && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
              <div className="font-semibold mb-1">Token (first 20 chars):</div>
              <div className="font-mono break-all">
                {tokenInfo.tokenManager.substring(0, 20)}...
              </div>
              <button 
                onClick={() => copyToClipboard(tokenInfo.tokenManager)}
                className="mt-1 text-blue-600 hover:text-blue-800 text-xs"
              >
                Copy Full Token
              </button>
            </div>
          )}

          {tokenInfo.decoded && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
              <div className="font-semibold mb-1">Decoded Info:</div>
              <div className="font-mono text-xs">
                <div>User: {tokenInfo.decoded.uName || tokenInfo.decoded.name || 'N/A'}</div>
                <div>Role: {tokenInfo.decoded.role_category || 'N/A'}</div>
                <div>Exp: {new Date(tokenInfo.decoded.exp * 1000).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={updateTokenInfo}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="Refresh token info"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleRemoveToken}
                className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                title="Remove all tokens"
              >
                🗑️ Clear All
              </button>
            </div>
            
            {/* Test Token Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Test token..."
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveTestToken}
                className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                title="Save test token"
              >
                💾 Save
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            <div>Domain: {window.location.hostname}</div>
            <div>Protocol: {window.location.protocol}</div>
            <div>Port: {window.location.port || 'default'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDebug;
