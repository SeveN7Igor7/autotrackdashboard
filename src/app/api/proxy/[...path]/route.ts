// Proxy para API HTTP - SOLUÇÃO DEFINITIVA PARA MIXED CONTENT
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://192.168.111.10:3000';

export async function GET(request: NextRequest) {
  return handleApiProxy(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleApiProxy(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleApiProxy(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleApiProxy(request, 'DELETE');
}

async function handleApiProxy(request: NextRequest, method: string) {
  try {
    // Pega o path da URL atual e remove /api/proxy
    const url = new URL(request.url);
    const apiPath = url.pathname.replace('/api/proxy', '');
    const searchParams = url.searchParams.toString();
    
    // Constrói a URL final da API HTTP
    const targetUrl = `${API_BASE_URL}${apiPath}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`[API Proxy] ${method} ${targetUrl}`);
    
    // Prepara opções da requisição
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    
    // Adiciona body para POST/PUT
    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await request.text();
        if (body) {
          options.body = body;
        }
      } catch (error) {
        console.log('[API Proxy] No body to forward');
      }
    }
    
    // Faz a requisição para API HTTP
    const response = await fetch(targetUrl, options);
    
    // Pega o conteúdo da resposta
    const data = await response.text();
    
    // Retorna a resposta com os headers corretos
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
    
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Proxy error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to connect to HTTP API'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}