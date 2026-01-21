export enum CurrencyENUM {
    USD = 'USD',
    EUR = 'EUR',
    ARS = 'ARS',
  }

  export enum BadgetTypeENUM {
    RENT = 'Alquiler',
    SELL = 'Venta',
    MAINTENCE = 'Mantenimiento',
    CALIBRATION = 'Calibración',
  }

  export enum VatENUM {
    TWENTY = `21`,
    TEN = `10,5`,
    NO_IVA = `NO_IVA`,
    EXEMPT = `EXEMPT`,
  }

  export const VatLabel = {
    [VatENUM.TWENTY]: `21%`,
    [VatENUM.TEN]: `10,5%`,
    [VatENUM.NO_IVA]: `SIN IVA`,
    [VatENUM.EXEMPT]: `IVA EXCENTO`,
  }
  
  export enum PriceLabelENUM {
    RENT_USD = "Alquiler en Dolares",
    RENT_ARS = "Alquiler en Pesos",
    SELL = "Venta"
  }

  export enum NotesLabelENUM {
    VALIDEZ_OFERTA = "Validez de la oferta",
    PLAZO_ENTREGA = "Plazo de entrega",
    RESTRICCION_IMPORTACION = "Restricciones a la importación",
    FACTURACION =  "Facturación",
    CONDICION_FISCAL = "Condiciones fiscales",
    LUGAR_ENTREGA = "Lugar de entrega",
    SEGURO_TRANSPORTE = "Seguro de transporte",
    GARANTIA = "Garantía",
    CALIBRACION_AUTORIZADA =  "Calibraciones autorizadas"
  }

  export const Notes : Record<NotesLabelENUM, string> = {
    [NotesLabelENUM.VALIDEZ_OFERTA]: `<b>${NotesLabelENUM.VALIDEZ_OFERTA}</b>: Luego de vencido el plazo informado en el documento, consultar mantenimiento o variación de la oferta.`,
    [NotesLabelENUM.GARANTIA]: `<b>${NotesLabelENUM.GARANTIA}</b>: Garantía: 3 (TRES) MESES incluyendo el cambio de repuestos y/o elementos defectuosos por mal ensamblado o por fatiga prematura del material, no atribuibles a mal uso, abuso o desuso, impericia o imprudencia, entendiéndose como tales cualquier maniobra que no esté taxativamente detallada en el manual de operaciones, contados a partir de la fecha en que los bienes hayan sido entregados, o puestos en uso en caso de requerirse la intervención del Proveedor para tales efectos. No incluye consumibles tales como pilas, baterías, filtros, etc. ni daños causados por operación incorrecta o malos tratos, ni re-calibraciones posteriores a la entrega.`,
    [NotesLabelENUM.CALIBRACION_AUTORIZADA]: `<b>${NotesLabelENUM.CALIBRACION_AUTORIZADA}</b>: Solo personal del laboratorio de Calibraciones ITM S.A. está autorizado a re-calibrar los equipos. En caso de que un tercero manipule el instrumento, se perderá la garantía. 	Recomendamos enfáticamente no intervenir instrumentos.`,
    [NotesLabelENUM.SEGURO_TRANSPORTE]: `<b>${NotesLabelENUM.SEGURO_TRANSPORTE}</b>: En caso de que el cliente solicite expresamente que Calibraciones ITM S.A. gestione el transporte y seguro, se le informará el costo de dicha gestión y una vez aprobado el mismo se despachará el material y se le informará el número de guía y/o los datos que sean necesarios para realizar el seguimiento del envío aceptando el cliente que la responsabilidad desde la salida de las oficinas de Calibraciones ITM S.A.

    Estará a exclusivo cargo del cliente el costo del envío y de la misma manera que cualquier gestión por inconvenientes en la entrega y tramitaciones con la empresa de transporte y/o compañía de seguros, liberando a Calibraciones ITM S.A. de toda responsabilidad sobre dichas gestiones.`,
    [NotesLabelENUM.LUGAR_ENTREGA]: `<b>${NotesLabelENUM.LUGAR_ENTREGA}</b>: Todos los equipos o productos serán entregados en nuestras oficinas en Almafuerte 357, Bahía Blanca (B8000), Buenos Aires, Argentina.
    En caso de solicitar envío a las instalaciones del cliente, el flete quedará a cargo del solicitante. 
    
    Calibraciones ITM S.A. deslinda toda responsabilidad por eventuales daños que pudiera sufrir el material una vez egresado de la empresa. Si el comprador desea cubrir ese riesgo mediante un seguro, la gestión y costo del mismo estarán a su cargo. La contratación o no de seguro deberá señalarse expresamente en la orden de compra o conformidad de servicio (según corresponda), y la no información al respecto supone todo el riesgo asumido por cuenta del comprador.`,
    [NotesLabelENUM.CONDICION_FISCAL]: `<b>${NotesLabelENUM.CONDICION_FISCAL}</b>: I. V. A.: La presente cotización no incluye I.V.A. en los precios expresados y se sumará en la factura al momento de realizarse.`,
    [NotesLabelENUM.FACTURACION]: `<b>${NotesLabelENUM.FACTURACION}</b>: A la fecha de facturación se utilizará el tipo de cambio del Banco de la Nación Argentina libre vendedor (cotización DIVISA) vigente al día anterior al de emisión de la factura. 

Si se produjera una variación del tipo de cambio entre el utilizado para la facturación y el vigente al día anterior al de la fecha de acreditación del pago mamyor al 5%, Calibraciones ITM S.A. emitirá una nota de crédito o de débito según fuera el caso, en la cual se indicará el monto que pudiera corresponder por el ajuste del tipo de cambio entre dichas fechas, con imputación a este acuerdo.
     
En caso de realizar una facturación parcial por diferencia entre los plazos de entrega de cada item, Calibraciones ITM S.A. indicará que items se facturarán en conjunto y cuales no, y, en consecuencia, se deberán aceptar entregas parciales con facturación y pago parcial.
    
Los ítems cotizados en DÓLARES ESTADOUNIDENSES (US$), pueden pagarse en PESOS ARGENTINOS (AR$).`,
    [NotesLabelENUM.RESTRICCION_IMPORTACION]: `<b>${NotesLabelENUM.RESTRICCION_IMPORTACION}</b>: Debido a las recientes resoluciones del B.C.R.A. que restringen la posibilidad de realizar transferencias al exterior, el plazo de entrega de todo material a importar queda sujeto a confirmación. Toda orden de compra emitida a partir de esta cotización debe contemplar esta situación y liberar de responsabilidad a Calibraciones ITM s.a. ante posibles demoras ajenas a su voluntad sufridas en relación con los plazos normales de gestión de importaciones. Calibraciones ITM s.a se compromete a aplicar toda su experiencia de 25 años en la materia para superar estos inconvenientes y que impacten en la menor medida posible en el cumplimiento de los plazos de entrega estimados.`,
    [NotesLabelENUM.PLAZO_ENTREGA]: `<b>${NotesLabelENUM.PLAZO_ENTREGA}</b>: Los días que se informan en el documento son hábiles posteriores a partir de recibida la orden de compra. 
    
En el caso “Entrega inmediata - Salvo venta”, se tendrá que tener en consideración el stock existente y que no se reservan productos hasta recibida las órdenes de compra.

En el caso “Item a importar”, el plazo se extenderá de 30 a 180 días de recibida la orden de compra. En caso de anticipos solicitados, el tiempo comenzará a correr hasta haberse acreditado el mismo.					
Este plazo es nuestra mejor estimación actual y puede sufrir variaciones por eventos ajenos a nuestra voluntad, como ser retrasos imprevistos en la producción del fabricante, problemas temporarios en el transporte internacional o demoras en los permisos aduaneros, circunstancias que no dependen de nuestro accionar a pesar de lo cual estaremos siempre atentos a su seguimiento para reducir los tiempos finales de disposición del material.	
Al momento de redactar estas condiciones, los productos cotizados no se encuentran prohibidos ni restringida su importación. Sin embargo, aclaramos que cualquier restricción derivada de modificaciones a los regímenes de importación por parte de la AFIP, Aduana, Secretaría de Comercio, Banco Central y demás organismos públicos con injerencia podría afectar el plazo de entrega, ya que los productos podrían encontrarse total o parcialmente sujetos a demoras, por lo que no implicará responsabilidad alguna por parte de Calibraciones ITM S.A., ni será aceptada la aplicación de multas o penalidades de ningún tipo. Asimismo, el Comprador reconoce y acepta que Calibraciones ITM S.A. no estará obligado a impugnar leyes, decretos, resoluciones, normas o reglamentaciones que restrinjan o demoren la importación al país de productos, ni a promover defensas en sede administrativa o judicial en procura de licencias y/o autorizaciones para la importación de productos, liberando automáticamente a Calibraciones ITM S.A. de toda responsabilidad ante cualquier retraso en la importación o imposibilidad de concretarla motivados por dichas restricciones.`,
    

  }
  