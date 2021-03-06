import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

import {
  Button,
  EntityList,
  EntityListItem,
  FormLabel,
  TextInput,
} from '@contentful/forma-36-react-components';

import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';


export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);
    this.state = {
      productList: props.sdk.field.getValue() || [],
      productOptions: [],
      activeOption: 0,
      filteredOptions: [],
      showOptions: false,
      userInput: '',
    };
  }

  componentDidMount() {
    this.props.sdk.window.startAutoResizer();

    // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange);
  }

  componentWillUnmount() {
    if (this.detachExternalChangeHandler) {
      this.detachExternalChangeHandler();
    }
  }

  // Test method to output the saved field value
  checkFieldValue = () => {
    const fieldValue = this.props.sdk.field.getValue();
    console.log(fieldValue);
  }

  onExternalChange = value => {
    // this.setState({ value });
    console.log('onExternalChange');
  };

  onChange = e => {
    this.submitSearch(e.currentTarget.value);
  };

  // Conduct the actual search against the provided productOptions
  search = (userInput, productOptions) => {
    const { productList } = this.state;

    const product = userInput.toLowerCase();

    const filteredOptions = productOptions.filter(
      (option) => {
        const hasBeenSelected = productList.find(product => product.name === option.name);

        return option.name.toLowerCase().indexOf(product) > -1 && !hasBeenSelected
      }
    );

    this.setState({
      activeOption: 0,
      showOptions: true,
      userInput,
      productOptions,
      filteredOptions,
    });
  }

  formatQuery = str => {
    const esc = (str) ? encodeURIComponent(str) : false;

    // if str defined replace its spaces with +
    return (esc) ? esc.replace(/%20/g, '+') : '';
  }

  submitSearch = (userInput) => {
    const base = 'https://swapi.co/api/people/?search=';

    axios.get(`${base}${this.formatQuery(userInput)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      })
    .then((response) => {
      console.log('then')
      if (response.ok || response.status === 200) {
        this.search(userInput, response.data.results);

        return console.log('success: ', response);
      }
      const error = new Error(response.statusText);
      error.response = response;

      return console.log('error in then: ', response);
    })
    .catch(error => console.log('error in catch: ', error));
  };

  submitSearchQuery = () => {
    const userInput = 'bees';
    const base = 'https://www.edx.org/api/v1/catalog/search?query=';

    axios.get(`${base}${this.formatQuery(userInput)}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // 'X-CSRFToken': getCSRFCookie(),
        },
      })
    .then((response) => {
      console.log('then')
      if (response.ok || response.status === 200) {
        return console.log('success: ', response);
      }
      const error = new Error(response.statusText);
      error.response = response;

      return console.log('error in then: ', response);
    })
    .catch(error => console.log('error in catch: ', error));

    this.checkFieldValue();
  };

  addProduct = (e) => {
    const { productList, productOptions } = this.state;
    const productName = e.currentTarget.innerText;
    const product = productOptions.find(option => option.name === productName);

    if (product) {
      productList.push(product);
    }

    this.props.sdk.field.setValue(productList);

    this.setState({
      activeOption: 0,
      filteredOption: [],
      showOptions: false,
      userInput: product,
      productList,
    });
  };

  removeProduct = productName => {
    const { productList } = this.state;
    const updatedProductList = productList.filter(item => item.name !== productName);
    console.log('remove me: ', productName);

    
    this.props.sdk.field.setValue(updatedProductList);

    this.setState({
      productList: updatedProductList
    });
  }

  getOptions = () => {
    const {
      showOptions,
      userInput,
      filteredOptions,
      activeOption,
    } = this.state;

    if (showOptions && userInput) {
      if (filteredOptions.length) {
        return (
          <ul className="options">
            {filteredOptions.map((option, index) => {
              let className;
              if (index === activeOption) {
                className = 'option-active';
              }
              return (
                <li className={className} key={option.name}>
                  <Button
                    buttonType="muted"
                    onClick={this.addProduct}
                    className="f36-margin-bottom--m"
                  >{option.name}
                  </Button>
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <div className="no-options">
          <em>No Option!</em>
        </div>
      );
    }

    return null;
  }

  getProducts = () => {
    const { productList } = this.state;

    if (productList.length === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <h2>Selected Products</h2>
        <EntityList>
          {productList.map(product =>
            <EntityListItem
              contentType="MITx"
              description="Course"
              entityType="entry"
              thumbnailUrl="https://www.placebear.com/46/46"
              isActionsDisabled={false}
              dropdownListElements={<Button onClick={() => this.removeProduct(product.name)}>X</Button>}
              status="published"
              testId="cf-ui-entity-list-item"
              title={product.name}
              key={product.name}
              withDragHandle={true}
              isDragActive={true}
            />)}
        </EntityList>
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <FormLabel htmlFor="cardList" className="f36-margin-top--l">Product list selection</FormLabel>
        <div className="product-search-container">
          <TextInput
            width="large"
            type="text"
            name="cardList"
            id="my-field"
            testId="my-field"
            value={this.state.value}
            onChange={this.onChange}
          />
          <Button
            buttonType="primary"
            icon="Search"
            onClick={this.submitSearchQuery}
          >
            Search
          </Button>
        </div>
        {this.getOptions()}
        {this.getProducts()}
      </React.Fragment>
    );
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
