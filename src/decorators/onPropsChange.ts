const onPropsChange: MethodDecorator = (target, propertyKey, descriptor) => {
  console.log(target, propertyKey, descriptor);
};

export default onPropsChange;
