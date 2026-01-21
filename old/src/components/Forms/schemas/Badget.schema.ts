import * as Yup from "yup";
const BadgetSchema = Yup.object().shape({
    id: Yup.string(),
    instrumentsRelated: Yup.array().optional(),
    types: Yup.array().notRequired().of(Yup.string()),
    client: Yup.string(),
    user: Yup.string(),
    attention: Yup.string(),
    advisor: Yup.string(),
    reference: Yup.string(),
    office: Yup.string().required('La oficina es requerida'),
    date: Yup.string().required('La fechaa es requerida'),
    deliveryTime: Yup.string().required('El tiempo de entrega es requerido'),
    offerValidity: Yup
      .number()
      .typeError('La validez de la oferta debe ser un número')
      .required('La validez de la oferta es requerida')
      .positive('La validez de la oferta debe ser un número positivo'),
    paymentTerms: Yup.string().required('Los términos de pago son requeridos'),
    currency: Yup.string().required('La moneda es requerida'),
    vat: Yup.string().required('El IVA es requerido'),
    notes: Yup.string(),
    showTotal: Yup.boolean(),
    selectedNotes: Yup.array().notRequired().of(Yup.string()),
    details: Yup.array().notRequired().of(
      Yup.object().shape({
        quantity: Yup
          .number()
          .typeError('La cantidad debe ser un número')
          .required('La cantidad es requerida')
          .positive('La cantidad debe ser un número positivo'),
        description: Yup.string().required('La descripción es requerida'),
        unitPrice: Yup
          .number()
          .typeError('El precio unitario debe ser un número')
          .required('El precio unitario es requerido')
          .positive('El precio unitario debe ser un número positivo'),
        discount: Yup
          .number()
          .typeError('El descuento debe ser un número')
          .required('El descuento es requerido')
          .min(0, 'El descuento no puede ser negativo'),
        totalPrice: Yup
          .number()
          .typeError('El precio total debe ser un número')
          .required('El precio total es requerido')
          .positive('El precio total debe ser un número positivo'),
      })
    ),
  })

  export default BadgetSchema