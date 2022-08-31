#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ECommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '409881362537',
  region: 'us-east-1'
}

const tags = {
  cost: 'ECommerce',
  team: 'NatCamarinha'
}

const productsAppLayersStack = new ProductsAppLayersStack(app, 'ProductsAppLayers', {
  tags: tags,
  env: env
})

// A stack de ecommerce precisa receber umn parâmetro da stack de produto, então a stack de produto precisa ser criada primeiro.
const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  tags: tags,
  env: env
})
productsAppStack.addDependency(productsAppLayersStack)

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
})
eCommerceApiStack.addDependency(productsAppStack)
