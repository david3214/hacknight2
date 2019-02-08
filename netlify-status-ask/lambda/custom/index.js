/* eslint-disable  func-names */
/* eslint-disable  no-console */
const Alexa = require('ask-sdk-core')
const netlifyToken = process.env.NETLIFY_TOKEN
const Netlify = require('netlify')
const client = new Netlify(netlifyToken)

const SiteList = require('list.json')

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speechText = 'This is a test! Houston we have lift off'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent'
    )
  },
  handle(handlerInput) {
    const speechText = 'Hello World!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    )
  },
  handle(handlerInput) {
    const speechText = 'You can ask me to say hello to netlify!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name ===
        'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name ===
          'AMAZON.StopIntent')
    )
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    )

    return handlerInput.responseBuilder.getResponse()
  }
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse()
  }
}

const CheckNetlifyStatusIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name ===
        'CheckNetlifyStatusIntent'
    )
  },
  async handle(handlerInput) {
    const sites = await client.listSites()

    const listData = sites.map(s => ({
      listItemIdentifier: s.id,
      ordinalNumber: 1,
      textContent: {
        primaryText: {
          type: 'PlainText',
          text: s.name
        },
        secondaryText: {
          type: 'PlainText',
          text: s.published_deploy && s.published_deploy.published_at
        }
      },
      image: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url: s.screenshot_url,
            size: 'small',
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url: s.screenshot_url,
            size: 'large',
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      token: s.id
    }))

    const firstOne = sites[0].name || 'Not Available'
    const text = `${firstOne} is looking good!`

    return handlerInput.responseBuilder
      .speak(text)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        version: '1.0',
        document: SiteList,
        datasources: {
          listTemplate1Metadata: {
            type: 'object',
            objectId: 'lt1Metadata',
            backgroundImage: {
              contentDescription: null,
              smallSourceUrl: null,
              largeSourceUrl: null,
              sources: [
                {
                  url:
                    'https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png',
                  size: 'small',
                  widthPixels: 0,
                  heightPixels: 0
                },
                {
                  url:
                    'https://d2o906d8ln7ui1.cloudfront.net/images/LT1_Background.png',
                  size: 'large',
                  widthPixels: 0,
                  heightPixels: 0
                }
              ]
            },
            title: 'Netlify Sites',
            logoUrl: 'https://www.netlify.com/img/press/logos/logomark.png'
          },
          listTemplate1ListData: {
            type: 'list',
            listId: 'lt1Sample',
            totalNumberOfItems: sites.length,
            listPage: {
              listItems: listData
            }
          }
        }
      })
      .getResponse()
  }
}

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    CheckNetlifyStatusIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
