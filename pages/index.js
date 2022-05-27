import {
  Alert,
  CircularProgress,
  Grid,
  Container,
  Box,
  Button,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import client from '../utils/client';
import { urlForThumbnail } from '../utils/image';
import { Store } from '../utils/Store';

export default function Home() {
  const {
    state: { cart },
    dispatch,
  } = useContext(Store);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [state, setState] = useState({
    products: [],
    error: '',
    loading: true,
  });
  const { loading, error, products } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await client.fetch(`*[_type == "product"]`);
        setState({ products, loading: false });
      } catch (err) {
        setState({ loading: false, error: err.message });
      }
    };
    fetchData();
  }, []);

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      enqueueSnackbar('Sorry. Product is out of stock', { variant: 'error' });
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        _key: product._id,
        name: product.name,
        countInStock: product.countInStock,
        slug: product.slug.current,
        price: product.price,
        image: urlForThumbnail(product.image),
        quantity,
      },
    });
    enqueueSnackbar(`${product.name} added to the cart`, {
      variant: 'success',
    });
    router.push('/cart');
  };
  return (
    <Layout>
      <Box
        component="header"
        bgcolor="text.disabled"
        color="dark"
        marginTop={2}
      >
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={5} sm={3}>
              <Box marginTop={10} fontSize={35}>
                ASTIG 03
              </Box>
            </Grid>
            <Grid item xs={5} sm={3} marginTop={10}></Grid>
            <Grid item xs={5} sm={6}>
              <Box borderBottom={1} fontSize={30}>
                YOUR SHOPPING VENTURES STARTS HERE
              </Box>
              <Box>
                <Typography color="inherit" marginTop={5}>
                  Check out more products that suit your style
                </Typography>
                <Box marginTop={4}></Box>
                <Button variant="contained" marginTop={10} href="/search">
                  VIEW PRODUCTS
                </Button>
              </Box>
              <Box marginTop={10}></Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item md={4} key={product.slug}>
              <ProductItem
                product={product}
                addToCartHandler={addToCartHandler}
              ></ProductItem>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
}
