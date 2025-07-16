import { NextRequest, NextResponse } from "next/server";
import { withMetrics, recordBusinessMetric } from "@/telemetry/metrics";
import connectMongoDB from "@/lib/dbConnect";
import Achievementmodel from "@/models/Achievements";

// Example: Enhanced API route with metrics tracking
export const GET = withMetrics(async (request: NextRequest) => {
  const startTime = Date.now();
  
  try {
    // Connect to database
    await connectMongoDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    
    // Build query
    const query = category ? { category } : {};
    
    // Fetch achievements
    const achievements = await Achievementmodel.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Achievementmodel.countDocuments(query);
    
    // Record custom business metrics
    recordBusinessMetric('achievements_queries_total', 1, {
      category: category || 'all',
      page: page.toString(),
      limit: limit.toString()
    });
    
    recordBusinessMetric('achievements_returned_total', achievements.length, {
      category: category || 'all'
    });
    
    // Log query performance
    const queryTime = Date.now() - startTime;
    if (queryTime > 1000) {
      console.warn(`Slow query detected: ${queryTime}ms`);
      recordBusinessMetric('slow_queries_total', 1, {
        endpoint: '/api/achievements',
        duration: Math.floor(queryTime / 1000).toString()
      });
    }
    
    return NextResponse.json({
      success: true,
      data: achievements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching achievements:', error);
    
    // Record error metrics
    recordBusinessMetric('database_errors_total', 1, {
      endpoint: '/api/achievements',
      error_type: 'database_query_failed'
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch achievements'
      },
      { status: 500 }
    );
  }
});

export const POST = withMetrics(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      recordBusinessMetric('validation_errors_total', 1, {
        endpoint: '/api/achievements',
        error_type: 'missing_required_fields'
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required'
        },
        { status: 400 }
      );
    }
    
    // Create achievement
    const achievement = await Achievementmodel.create(body);
    
    // Record success metrics
    recordBusinessMetric('achievements_created_total', 1, {
      category: body.category || 'uncategorized',
      batch: body.batch || 'unknown'
    });
    
    return NextResponse.json({
      success: true,
      data: achievement
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating achievement:', error);
    
    recordBusinessMetric('database_errors_total', 1, {
      endpoint: '/api/achievements',
      error_type: 'create_failed'
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create achievement'
      },
      { status: 500 }
    );
  }
});

// Example: Custom metrics for specific business logic
export const DELETE = withMetrics(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const achievement = await Achievementmodel.findById(id);
    
    if (!achievement) {
      recordBusinessMetric('not_found_errors_total', 1, {
        endpoint: '/api/achievements',
        resource_type: 'achievement'
      });
      
      return NextResponse.json(
        { success: false, error: 'Achievement not found' },
        { status: 404 }
      );
    }
    
    await Achievementmodel.findByIdAndDelete(id);
    
    // Record deletion metrics
    recordBusinessMetric('achievements_deleted_total', 1, {
      category: achievement.category || 'uncategorized'
    });
    
    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting achievement:', error);
    
    recordBusinessMetric('database_errors_total', 1, {
      endpoint: '/api/achievements',
      error_type: 'delete_failed'
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete achievement'
      },
      { status: 500 }
    );
  }
});

// Example: Health check endpoint with custom metrics
export const OPTIONS = withMetrics(async (request: NextRequest) => {
  try {
    await connectMongoDB();
    
    // Check database health
    const count = await Achievementmodel.estimatedDocumentCount();
    
    recordBusinessMetric('health_checks_total', 1, {
      endpoint: '/api/achievements',
      status: 'healthy'
    });
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      documentCount: count
    });
    
  } catch (error) {
    recordBusinessMetric('health_checks_total', 1, {
      endpoint: '/api/achievements',
      status: 'unhealthy'
    });
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: 'Database connection failed'
      },
      { status: 503 }
    );
  }
}); 