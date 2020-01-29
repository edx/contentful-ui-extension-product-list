import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import {
  Button,
  EntityList,
  EntityListItem,
  FormLabel,
  TextInput,
} from '@contentful/forma-36-react-components';
import { init } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

export class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired,
    products: PropTypes.arrayOf(PropTypes.string),
  };

  detachExternalChangeHandler = null;

  constructor(props) {
    super(props);
    this.state = {
      productList: props.sdk.field.getValue() || [],
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

  onExternalChange = value => {
    // this.setState({ value });
    console.log('onExternalChange');
  };

  // onChange = e => {
  //   const value = e.currentTarget.value;
  //   console.log(`onChange: ${value}`);
  //   this.setState({ value });
    
    // This is clearing the state
    // if (value) {
    //   this.props.sdk.field.setValue(value);
    // } else {
    //   this.props.sdk.field.removeValue();
    // }
  // };

  onChange = e => {
    console.log('changey McChangeFace');
    const userInput = e.currentTarget.value;
    const filteredOptions = this.search(userInput);

    this.setState({
      activeOption: 0,
      filteredOptions,
      showOptions: true,
      userInput
    });
  };

  search = userInput => {
    const { products } = this.props;
    const { productList } = this.state;
    const product = userInput.toLowerCase();

    return products.filter(
      (option) => 
        option.toLowerCase().indexOf(product) > -1 && !productList.includes(option)
    );
  }

  addProduct = (e) => {
    const product = e.currentTarget.innerText;
    const { productList } = this.state;
    productList.push(product);

    this.setState({
      activeOption: 0,
      filteredOption: [],
      showOptions: false,
      userInput: product,
      productList,
    });
  };

  removeProduct = product => {
    const { productList } = this.state;

    console.log('remove me: ', product);

    this.setState({
      productList: productList.filter(item => item !== product)
    });
  }

  onSearch = e => {
    console.log(`onSearch: ${this.state.value}`);
    console.log(this.props);
    this.render();
  };

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
            {filteredOptions.map((optionName, index) => {
              let className;
              if (index === activeOption) {
                className = 'option-active';
              }
              return (
                <li className={className} key={optionName}>
                  <Button
                    buttonType="muted"
                    onClick={this.addProduct}
                    className="f36-margin-bottom--m"
                  >{optionName}
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
              isActionsDisabled={false}
              dropdownListElements={<Button onClick={() => this.removeProduct(product)}>X</Button>}
              status="Course"
              testId="cf-ui-entity-list-item"
              title={product}
              withDragHandle={true}
            />)}
        </EntityList>
      </React.Fragment>
    );
  }

  render() {
    console.log('render me');
    console.log(this.getOptions());

    return (
      <React.Fragment>
        <FormLabel htmlFor="cardList">Product list selection</FormLabel>
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
          onClick={this.onSearch}
        >
          Search
        </Button>
        {this.getOptions()}
        {this.getProducts()}
      </React.Fragment>
    );
  }
}
const products = [
  'Papaya',
  'Persimmon',
  'Paw Paw',
  'Prickly Pear',
  'Peach',
  'Pomegranate',
  'Pineapple'
];
init(sdk => {
  ReactDOM.render(<App sdk={sdk} products={products} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
