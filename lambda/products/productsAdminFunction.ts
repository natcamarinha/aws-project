import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Product, ProductRepo } from "/opt/nodejs/productsLayer";
import { DynamoDB } from 'aws-sdk';

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
const productRepo = new ProductRepo(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

  if (event.resource === '/products') {
    console.log('POST /products');

    const product = JSON.parse(event.body!) as Product;
    const productCreated = await productRepo.createProduct(product);

    return {
      statusCode: 201,
      body: JSON.stringify(productCreated)
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    if (event.httpMethod === 'PUT') {
      console.log(`PUT /products/${productId}`);
      const product = JSON.parse(event.body!) as Product;
      try {
        const productUpdated = await productRepo.updateProduct(productId, product);
        return {
          statusCode: 200,
          body: JSON.stringify(productUpdated)
        }
      } catch (ConditionalCheckFailedException) {
        return {
          statusCode: 404,
          body: 'Product not found'
        }
      }
    } else if (event.httpMethod === 'DELETE') {
      console.log(`DELETE /products/${productId}`);
      try {
        const product = await productRepo.deleteProduct(productId);
        return {
          statusCode: 200,
          body: JSON.stringify(product)
        }
      } catch (e) {
        console.error((<Error>e).message)
        return {
          statusCode: 400,
          body: (<Error>e).message
        }
      }
    }
  }

  return {
    statusCode: 400,
    body: 'Bad request'
  }
}