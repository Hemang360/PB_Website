import { InstrumentationBase, InstrumentationConfig, InstrumentationModuleDefinition } from '@opentelemetry/instrumentation';
import { context, trace } from '@opentelemetry/api';
import type { NextRequest, NextResponse } from 'next/server';

export class NextInstrumentation extends InstrumentationBase {
  constructor(config: InstrumentationConfig = {}) {
    super('next-instrumentation', '0.1.0', config);
  }
  
  override init(): InstrumentationModuleDefinition[] {
    return [];
  }
}

export function nextInstrumentation(config: InstrumentationConfig = {}) {
  return new NextInstrumentation(config);
}

export function extractRequestData(request: NextRequest) {
  const { method } = request;
  const url = request.url || 'unknown';
  let path = 'unknown';
  try {
    const parsedUrl = new URL(url);
    path = parsedUrl.pathname;
  } catch (e) {
    console.error('Error parsing URL:', e);
  }
  return {
    method,
    url,
    path
  };
}

export async function withTelemetry<T>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>,
  request: NextRequest,
  routePath: string
): Promise<NextResponse<T>> {
  const tracer = trace.getTracer('next-routes');
  const requestData = extractRequestData(request);
  const span = tracer.startSpan(`${requestData.method} ${routePath}`);
  try {
    const result = await handler(request);
    span.end();
    return result;
  } catch (error) {
    span.recordException(error as Error);
    span.end();
    throw error;
  }
}