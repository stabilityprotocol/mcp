import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express, { Request, Response } from 'express';
import { logger, env } from '@stability-mcp/utils';
import morgan from 'morgan';
import cors from 'cors';
import { z } from 'zod';
import { IMCPTool } from '@stability-mcp/types';
import { randomUUID } from 'node:crypto';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import walletTools from '@stability-mcp/wallet';
import contractsTools from '@stability-mcp/contracts';
import blockchainTools from '@stability-mcp/blockchain';

const toolsEndpoints: Record<string, IMCPTool<any, any>[]> = {
  wallet: walletTools,
  contracts: contractsTools,
  blockchain: blockchainTools,
};

// Merged endpoint with all tools
const allTools = Object.values(toolsEndpoints).flat();
const allEndpoints = { ...toolsEndpoints, '': allTools };

const getMcpServer = (tools: IMCPTool<any, any>[]) => {
  try {
    const server = new McpServer({
      name: 'stability-mcp',
      version: '1.0.0',
    });
    tools.forEach((tool: IMCPTool<any, any>) => {
      if (tool.outputSchema) {
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: tool.inputSchema?.shape,
            outputSchema: tool.outputSchema.shape,
          },
          async (args: z.infer<typeof tool.inputSchema>) => {
            const result = await tool.handler(args);
            return result;
          }
        );
      } else {
        server.tool(
          tool.name,
          tool.description,
          tool.inputSchema?.shape,
          async (args: z.infer<typeof tool.inputSchema>) => {
            const result = await tool.handler(args);
            return result;
          }
        );
      }
    });
    return server;
  } catch (error) {
    logger.error({
      message: 'Error initializing MCP server',
      error,
    });
    throw error;
  }
};

const app = express();
app.use(morgan('combined'));
app.use(express.json());
app.use(cors());

const transports: Record<
  string,
  StreamableHTTPServerTransport | SSEServerTransport
> = {};

Object.entries(allEndpoints).forEach(([endpoint, tools]) => {
  // MCP endpoint for specific tool set or merged endpoint
  const mcpPath = endpoint === '' ? '/mcp' : `/mcp/${endpoint}`;
  app.all(mcpPath, async (req: Request, res: Response) => {
    logger.info({
      endpoint: mcpPath,
      method: req.method,
      message: `Received ${req.method} request to ${mcpPath}`,
    });
    try {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      const sessionKey = `${endpoint}-${sessionId}`;
      let transport: StreamableHTTPServerTransport | undefined = undefined;
      const server = getMcpServer(tools);

      if (sessionId && transports[sessionKey]) {
        const existingTransport = transports[sessionKey];
        if (existingTransport instanceof StreamableHTTPServerTransport) {
          transport = existingTransport;
          logger.info({
            endpoint: mcpPath,
            message: `Reusing existing StreamableHTTPServerTransport for session ${sessionId}`,
          });
        } else {
          logger.warn({
            endpoint: mcpPath,
            message: `Session ${sessionId} exists but uses a different transport protocol.`,
          });
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message:
                'Bad Request: Session exists but uses a different transport protocol',
            },
            id: null,
          });
          return;
        }
      } else if (
        !sessionId &&
        req.method === 'POST' &&
        isInitializeRequest(req.body)
      ) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: randomUUID,
          enableJsonResponse: true,
          onsessioninitialized: (newSessionId) => {
            logger.info({
              endpoint: mcpPath,
              message: `StreamableHTTP session initialized with ID: ${newSessionId}`,
            });
            if (transport)
              transports[`${endpoint}-${newSessionId}`] = transport;
          },
        });

        transport.onclose = () => {
          const sid = transport?.sessionId;
          if (sid && transports[`${endpoint}-${sid}`]) {
            logger.info({
              endpoint: mcpPath,
              message: `Transport closed for session ${sid}, removing from transports map`,
            });
            delete transports[`${endpoint}-${sid}`];
          }
          server.close();
        };
        await server.connect(transport);
        logger.info({
          endpoint: mcpPath,
          message: 'New StreamableHTTPServerTransport created and connected.',
        });
      } else {
        logger.warn({
          endpoint: mcpPath,
          message:
            'Bad Request: No valid session ID provided for non-POST-initialize request, or invalid request.',
        });
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message:
              'Bad Request: No valid session ID provided or not an initialization request',
          },
          id: null,
        });
        return;
      }

      if (!transport) {
        logger.error({
          endpoint: mcpPath,
          message: 'Transport could not be established or reconnected.',
        });
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Internal Server Error: Transport not available.',
            },
            id: null,
          });
        }
        return;
      }

      if (!(sessionId && transports[sessionKey])) {
        res.on('close', () => {
          logger.info({
            endpoint: mcpPath,
            message: `Request closed for new StreamableHTTP session: ${transport?.sessionId}`,
          });
        });
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error({
        endpoint: mcpPath,
        message: 'Internal server error',
        error,
      });
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // SSE endpoint for specific tool set or merged endpoint
  const ssePath = endpoint === '' ? '/sse' : `/sse/${endpoint}`;
  const messagesPath = endpoint === '' ? '/messages' : `/messages/${endpoint}`;

  app.get(ssePath, async (req: Request, res: Response) => {
    logger.info({
      endpoint: ssePath,
      message: `Received GET request to ${ssePath}`,
    });
    const server = getMcpServer(tools);
    const transport = new SSEServerTransport(messagesPath, res);
    const sessionKey = `${endpoint}-${transport.sessionId}`;
    transports[sessionKey] = transport;

    res.on('close', () => {
      logger.info({
        endpoint: ssePath,
        message: `SSE connection closed for session ${transport.sessionId}`,
      });
      delete transports[sessionKey];
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
    } catch (error) {
      logger.error({
        endpoint: ssePath,
        message: 'Error connecting SSE transport',
        error,
      });
      if (!res.headersSent) {
        res.status(500).send('Error establishing SSE connection');
      }
    }
  });

  // Messages endpoint for specific tool set or merged endpoint
  app.post(messagesPath, async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const sessionKey = `${endpoint}-${sessionId}`;
    logger.info({
      endpoint: messagesPath,
      message: `Received POST request to ${messagesPath} for session ${sessionId}`,
    });

    const transport = transports[sessionKey];

    if (transport instanceof SSEServerTransport) {
      try {
        await transport.handlePostMessage(req, res, req.body);
      } catch (error) {
        logger.error({
          endpoint: messagesPath,
          message: 'Error handling POST message',
          error,
          sessionId,
        });
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error handling message',
            },
            id: req.body?.id || null,
          });
        }
      }
    } else if (transport) {
      logger.warn({
        endpoint: messagesPath,
        message: 'Session exists but uses a different transport protocol',
        sessionId,
      });
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message:
            'Bad Request: Session exists but uses a different transport protocol',
        },
        id: req.body?.id || null,
      });
    } else {
      logger.warn({
        endpoint: messagesPath,
        message: 'No transport found for sessionId',
        sessionId,
      });
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No transport found for sessionId',
        },
        id: req.body?.id || null,
      });
    }
  });

  // V1 tools endpoint for specific tool set or merged endpoint
  const v1ToolsPath = endpoint === '' ? '/v1/tools' : `/v1/tools/${endpoint}`;
  app.post(v1ToolsPath, async (req: Request, res: Response) => {
    try {
      const { tool, args } = req.body;
      if (!tool || !args) {
        res.status(400).json({
          error: 'Bad Request: Missing tool or args',
        });
        return;
      }
      const toolInstance = tools.find((t) => t.name === tool);
      if (!toolInstance) {
        res.status(400).json({
          error: 'Bad Request: Tool not found',
        });
        return;
      }

      // Extract API key from header and inject into args if needed
      const apiKeyFromHeader = req.headers['x-api-key'] as string;
      let processedArgs = { ...args };

      // If tool needs apiKey and it's not provided in args, inject from header
      if (toolInstance.inputSchema && apiKeyFromHeader) {
        const schemaShape =
          toolInstance.inputSchema.shape ||
          toolInstance.inputSchema._def?.shape;
        if (schemaShape && schemaShape.apiKey && !args.apiKey) {
          processedArgs.apiKey = apiKeyFromHeader;
        }
      }

      const inputSchema = toolInstance.inputSchema;
      if (inputSchema) {
        const parsedArgs = inputSchema.safeParse(processedArgs);
        if (!parsedArgs.success) {
          res.status(400).json({
            reason: parsedArgs.error.message,
            error: 'Bad Request: Invalid args',
          });
          return;
        }
        processedArgs = parsedArgs.data;
      }

      const result = await toolInstance.handler(processedArgs);
      if (result.structuredContent) {
        res.json(result.structuredContent);
      } else {
        res.json(result.content);
      }
    } catch (error) {
      logger.error({
        endpoint: v1ToolsPath,
        message: 'Error handling tool request',
        error,
      });
      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  });
});

app.get('/health', (_, res) => {
  res.send('OK');
});

// STDIO server function
async function startStdioServer(toolsToUse?: string) {
  let tools = allTools;

  if (toolsToUse && toolsEndpoints[toolsToUse]) {
    tools = toolsEndpoints[toolsToUse];
    logger.info({
      message: `Using ${toolsToUse} tools for STDIO server`,
    });
  } else if (toolsToUse) {
    logger.warn({
      message: `Unknown tools endpoint '${toolsToUse}', using all tools`,
    });
  }

  const server = getMcpServer(tools);
  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info({
    message: 'MCP STDIO server started',
    toolsCount: tools.length,
  });
}

// Check if running in STDIO mode
if (process.argv.includes('--stdio')) {
  // Check for tools argument (e.g., --tools=wallet)
  const toolsArg = process.argv.find((arg) => arg.startsWith('--tools='));
  const toolsToUse = toolsArg ? toolsArg.split('=')[1] : undefined;

  startStdioServer(toolsToUse).catch((error) => {
    logger.error({
      message: 'Error starting STDIO server',
      error,
    });
    process.exit(1);
  });
} else {
  // Start HTTP server
  const PORT = env('PORT', '3000');
  app.listen(PORT, () => {
    logger.info({
      message: `HTTP server is running on port ${PORT}`,
    });
  });
}
