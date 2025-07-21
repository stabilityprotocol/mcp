import { z } from 'zod';
import { IMCPTool, ReturnTypeStructuredContent } from '@stability-mcp/types';

export const addSchema = z.object({
  numbers: z
    .array(z.number())
    .min(2)
    .describe('Array of numbers to add together'),
});

export const addTool: IMCPTool<typeof addSchema, ReturnTypeStructuredContent> =
  {
    name: 'add',
    description: 'Add two or more numbers together',
    inputSchema: addSchema,
    handler: async (args) => {
      const { numbers } = args;
      const result = numbers.reduce((sum, num) => sum + num, 0);
      const operation = `${numbers.join(' + ')} = ${result}`;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ result, operation }),
          },
        ],
        structuredContent: { result, operation },
      };
    },
    outputSchema: z.object({
      result: z.number(),
      operation: z.string(),
    }),
  };

export const subtractSchema = z.object({
  minuend: z.number().describe('The number to subtract from'),
  subtrahend: z.number().describe('The number to subtract'),
});

export const subtractTool: IMCPTool<
  typeof subtractSchema,
  ReturnTypeStructuredContent
> = {
  name: 'subtract',
  description: 'Subtract one number from another',
  inputSchema: subtractSchema,
  handler: async (args) => {
    const { minuend, subtrahend } = args;
    const result = minuend - subtrahend;
    const operation = `${minuend} - ${subtrahend} = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const multiplySchema = z.object({
  numbers: z
    .array(z.number())
    .min(2)
    .describe('Array of numbers to multiply together'),
});

export const multiplyTool: IMCPTool<
  typeof multiplySchema,
  ReturnTypeStructuredContent
> = {
  name: 'multiply',
  description: 'Multiply two or more numbers together',
  inputSchema: multiplySchema,
  handler: async (args) => {
    const { numbers } = args;
    const result = numbers.reduce((product, num) => product * num, 1);
    const operation = `${numbers.join(' × ')} = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const divideSchema = z.object({
  dividend: z.number().describe('The number to be divided'),
  divisor: z
    .number()
    .refine((val) => val !== 0, 'Divisor cannot be zero')
    .describe('The number to divide by'),
});

export const divideTool: IMCPTool<
  typeof divideSchema,
  ReturnTypeStructuredContent
> = {
  name: 'divide',
  description: 'Divide one number by another',
  inputSchema: divideSchema,
  handler: async (args) => {
    const { dividend, divisor } = args;

    if (divisor === 0) {
      throw new Error('Division by zero is not allowed');
    }

    const result = dividend / divisor;
    const operation = `${dividend} ÷ ${divisor} = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const powerSchema = z.object({
  base: z.number().describe('The base number'),
  exponent: z.number().describe('The exponent'),
});

export const powerTool: IMCPTool<
  typeof powerSchema,
  ReturnTypeStructuredContent
> = {
  name: 'power',
  description: 'Raise a number to a given power',
  inputSchema: powerSchema,
  handler: async (args) => {
    const { base, exponent } = args;
    const result = Math.pow(base, exponent);
    const operation = `${base}^${exponent} = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const sqrtSchema = z.object({
  number: z
    .number()
    .min(0, 'Cannot calculate square root of negative number')
    .describe('The number to calculate square root of'),
});

export const sqrtTool: IMCPTool<
  typeof sqrtSchema,
  ReturnTypeStructuredContent
> = {
  name: 'sqrt',
  description: 'Calculate the square root of a number',
  inputSchema: sqrtSchema,
  handler: async (args) => {
    const { number } = args;

    if (number < 0) {
      throw new Error('Cannot calculate square root of negative number');
    }

    const result = Math.sqrt(number);
    const operation = `√${number} = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const percentageSchema = z.object({
  value: z.number().describe('The value to calculate percentage of'),
  percentage: z.number().describe('The percentage to calculate'),
});

export const percentageTool: IMCPTool<
  typeof percentageSchema,
  ReturnTypeStructuredContent
> = {
  name: 'percentage',
  description: 'Calculate a percentage of a number',
  inputSchema: percentageSchema,
  handler: async (args) => {
    const { value, percentage } = args;
    const result = (value * percentage) / 100;
    const operation = `${percentage}% of ${value} = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const factorialSchema = z.object({
  number: z
    .number()
    .int()
    .min(0, 'Factorial is only defined for non-negative integers')
    .describe('The non-negative integer to calculate factorial of'),
});

export const factorialTool: IMCPTool<
  typeof factorialSchema,
  ReturnTypeStructuredContent
> = {
  name: 'factorial',
  description: 'Calculate the factorial of a non-negative integer',
  inputSchema: factorialSchema,
  handler: async (args) => {
    const { number } = args;

    if (number < 0 || !Number.isInteger(number)) {
      throw new Error('Factorial is only defined for non-negative integers');
    }

    let result = 1;
    for (let i = 2; i <= number; i++) {
      result *= i;
    }

    const operation = `${number}! = ${result}`;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ result, operation }),
        },
      ],
      structuredContent: { result, operation },
    };
  },
  outputSchema: z.object({
    result: z.number(),
    operation: z.string(),
  }),
};

export const gcdSchema = z.object({
  a: z.number().int().describe('First integer'),
  b: z.number().int().describe('Second integer'),
});

export const gcdTool: IMCPTool<typeof gcdSchema, ReturnTypeStructuredContent> =
  {
    name: 'gcd',
    description: 'Calculate the Greatest Common Divisor (GCD) of two integers',
    inputSchema: gcdSchema,
    handler: async (args) => {
      const { a, b } = args;

      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        throw new Error('GCD is only defined for integers');
      }

      const gcd = (x: number, y: number): number => {
        return y === 0 ? Math.abs(x) : gcd(y, x % y);
      };

      const result = gcd(a, b);
      const operation = `GCD(${a}, ${b}) = ${result}`;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ result, operation }),
          },
        ],
        structuredContent: { result, operation },
      };
    },
    outputSchema: z.object({
      result: z.number(),
      operation: z.string(),
    }),
  };

export const lcmSchema = z.object({
  a: z.number().int().describe('First integer'),
  b: z.number().int().describe('Second integer'),
});

export const lcmTool: IMCPTool<typeof lcmSchema, ReturnTypeStructuredContent> =
  {
    name: 'lcm',
    description: 'Calculate the Least Common Multiple (LCM) of two integers',
    inputSchema: lcmSchema,
    handler: async (args) => {
      const { a, b } = args;

      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        throw new Error('LCM is only defined for integers');
      }

      const gcd = (x: number, y: number): number => {
        return y === 0 ? Math.abs(x) : gcd(y, x % y);
      };

      const result = Math.abs(a * b) / gcd(a, b);
      const operation = `LCM(${a}, ${b}) = ${result}`;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ result, operation }),
          },
        ],
        structuredContent: { result, operation },
      };
    },
    outputSchema: z.object({
      result: z.number(),
      operation: z.string(),
    }),
  };

export default [
  addTool,
  subtractTool,
  multiplyTool,
  divideTool,
  powerTool,
  sqrtTool,
  percentageTool,
  factorialTool,
  gcdTool,
  lcmTool,
];
