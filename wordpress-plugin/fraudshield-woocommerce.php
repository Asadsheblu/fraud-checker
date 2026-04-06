<?php
/**
 * Plugin Name: FraudShield for WooCommerce
 * Plugin URI: https://fraudshield.app
 * Description: Real-time fraud detection and prevention for WooCommerce stores
 * Version: 1.0.0
 * Author: FraudShield
 * Author URI: https://fraudshield.app
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Domain Path: /languages
 * Text Domain: fraudshield-woocommerce
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

define('FRAUDSHIELD_VERSION', '1.0.0');
define('FRAUDSHIELD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FRAUDSHIELD_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main FraudShield Plugin Class
 */
class FraudShieldWooCommerce {
    private static $instance = null;
    private $api_url = 'https://fraud-checker-1.onrender.com';
    private $api_key = '';
    private $enabled = false;

    public static function get_instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        $this->api_key = get_option('fraudshield_api_key');
        $this->enabled = get_option('fraudshield_enabled', false);

        // Admin hooks
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_notices', [$this, 'show_admin_notices']);

        // WooCommerce hooks
        if ($this->enabled && !empty($this->api_key)) {
            add_action('woocommerce_checkout_process', [$this, 'validate_order_on_checkout']);
            add_action('woocommerce_order_status_pending', [$this, 'analyze_order_for_fraud']);
            add_action('wp_ajax_nopriv_fraudshield_check_email', [$this, 'ajax_check_email']);
            add_action('wp_ajax_fraudshield_check_email', [$this, 'ajax_check_email']);
        }
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'FraudShield',
            'FraudShield',
            'manage_woocommerce',
            'fraudshield',
            [$this, 'render_admin_page']
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('fraudshield_settings', 'fraudshield_api_key');
        register_setting('fraudshield_settings', 'fraudshield_enabled');
        register_setting('fraudshield_settings', 'fraudshield_block_high_risk');
        register_setting('fraudshield_settings', 'fraudshield_review_risky');

        add_settings_section(
            'fraudshield_settings_section',
            'FraudShield Configuration',
            [$this, 'render_settings_section'],
            'fraudshield_settings'
        );

        add_settings_field(
            'fraudshield_api_key',
            'API Key',
            [$this, 'render_api_key_field'],
            'fraudshield_settings',
            'fraudshield_settings_section'
        );

        add_settings_field(
            'fraudshield_enabled',
            'Enable FraudShield',
            [$this, 'render_enabled_field'],
            'fraudshield_settings',
            'fraudshield_settings_section'
        );

        add_settings_field(
            'fraudshield_block_high_risk',
            'Block High-Risk Orders',
            [$this, 'render_block_field'],
            'fraudshield_settings',
            'fraudshield_settings_section'
        );

        add_settings_field(
            'fraudshield_review_risky',
            'Flag Risky Orders for Review',
            [$this, 'render_review_field'],
            'fraudshield_settings',
            'fraudshield_settings_section'
        );
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        if (!current_user_can('manage_woocommerce')) {
            return;
        }

        ?>
        <div class="wrap">
            <h1>FraudShield Settings</h1>
            
            <div class="fraudshield-dashboard">
                <div class="stats-container">
                    <?php
                    $stats = $this->get_stats();
                    if ($stats):
                    ?>
                        <div class="stat-card">
                            <h3>Orders Checked</h3>
                            <p class="stat-value"><?php echo intval($stats['total_orders']); ?></p>
                        </div>
                        <div class="stat-card">
                            <h3>Fraud Detected</h3>
                            <p class="stat-value fraud"><?php echo intval($stats['fraud_detected']); ?></p>
                        </div>
                        <div class="stat-card">
                            <h3>High Risk Orders</h3>
                            <p class="stat-value warning"><?php echo intval($stats['risky_orders']); ?></p>
                        </div>
                        <div class="stat-card">
                            <h3>Safe Orders</h3>
                            <p class="stat-value safe"><?php echo intval($stats['safe_orders']); ?></p>
                        </div>
                    <?php
                    endif;
                    ?>
                </div>
            </div>

            <form method="post" action="options.php">
                <?php
                settings_fields('fraudshield_settings');
                do_settings_sections('fraudshield_settings');
                submit_button();
                ?>
            </form>

            <style>
                .fraudshield-dashboard {
                    margin-top: 30px;
                }

                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .stat-card {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 20px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    margin: 10px 0 0 0;
                }

                .stat-value.fraud {
                    color: #dc2626;
                }

                .stat-value.warning {
                    color: #f59e0b;
                }

                .stat-value.safe {
                    color: #10b981;
                }

                .notice-error {
                    margin-top: 20px;
                }
            </style>
        </div>
        <?php
    }
/**
     * Show admin error/notice from transient
     */
    public function show_admin_notices() {
        $error = get_transient('fraudshield_admin_error');
        if ($error) {
            echo '<div class="notice notice-error is-dismissible"><p><strong>FraudShield:</strong> ' . esc_html($error) . '</p></div>';
            delete_transient('fraudshield_admin_error');
        }

        $notice = get_transient('fraudshield_admin_notice');
        if ($notice) {
            echo '<div class="notice notice-warning is-dismissible"><p><strong>FraudShield:</strong> ' . esc_html($notice) . '</p></div>';
            delete_transient('fraudshield_admin_notice');
        }
    }
    /**
     * Render settings section
     */
    public function render_settings_section() {
        echo '<p>Configure your FraudShield API key and preferences</p>';
    }

    /**
     * Render API key field
     */
    public function render_api_key_field() {
        $api_key = get_option('fraudshield_api_key');
        ?>
        <input 
            type="password" 
            name="fraudshield_api_key" 
            id="fraudshield_api_key"
            value="<?php echo esc_attr($api_key); ?>"
            class="regular-text"
            placeholder="fsh_..."
        />
        <button type="button" id="fraudshield_test_btn" class="button button-secondary" style="margin-left:10px;">
            Test Connection
        </button>
        <span id="fraudshield_test_result" style="margin-left:10px; font-weight:bold;"></span>
        <p class="description">Get your API key from your FraudShield dashboard</p>

        <script>
        document.getElementById('fraudshield_test_btn').addEventListener('click', function() {
            var key = document.getElementById('fraudshield_api_key').value;
            var result = document.getElementById('fraudshield_test_result');

            if (!key) {
                result.style.color = 'red';
                result.textContent = '❌ API Key লিখুন আগে';
                return;
            }

            result.style.color = 'gray';
            result.textContent = '⏳ Testing...';

            fetch('<?php echo esc_url($this->api_url); ?>/api/orders/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiKey: key,
                    customer: { email: 'test@fraudshield.app', name: 'Test User' },
                    amount: 1,
                    currency: 'USD',
                    shippingAddress: { country: 'US', state: 'CA', city: 'LA', zipCode: '90001', street: '123 Test St' },
                    paymentMethod: 'test'
                })
            })
            .then(function(res) {
                if (res.status === 401) {
                    result.style.color = 'red';
                    result.textContent = '❌ API Key ভুল';
                } else if (res.status === 200) {
                    result.style.color = 'green';
                    result.textContent = '✅ সংযোগ সফল! API Key সঠিক আছে';
                } else {
                    result.style.color = 'orange';
                    result.textContent = '⚠️ Server error: HTTP ' + res.status;
                }
            })
            .catch(function(err) {
                result.style.color = 'red';
                result.textContent = '❌ Server এ connect করা যাচ্ছে না';
            });
        });
        </script>
        <?php
    }

    /**
     * Render enabled field
     */
    public function render_enabled_field() {
        $enabled = get_option('fraudshield_enabled');
        ?>
        <input 
            type="checkbox" 
            name="fraudshield_enabled" 
            value="1"
            <?php checked($enabled, 1); ?>
        />
        <label>Enable real-time fraud detection for all orders</label>
        <?php
    }

    /**
     * Render block field
     */
    public function render_block_field() {
        $block = get_option('fraudshield_block_high_risk');
        ?>
        <input 
            type="checkbox" 
            name="fraudshield_block_high_risk" 
            value="1"
            <?php checked($block, 1); ?>
        />
        <label>Automatically block orders with very high fraud risk</label>
        <?php
    }

    /**
     * Render review field
     */
    public function render_review_field() {
        $review = get_option('fraudshield_review_risky');
        ?>
        <input 
            type="checkbox" 
            name="fraudshield_review_risky" 
            value="1"
            <?php checked($review, 1); ?>
        />
        <label>Flag risky orders for manual review</label>
        <?php
    }

    /**
     * Validate order on checkout
     */
    public function validate_order_on_checkout() {
        if (!$this->enabled || empty($this->api_key)) {
            return;
        }

        // Get current user data
        $user_id = get_current_user_id();
        $customer_email = isset($_POST['post_data']) ? 
            sanitize_email(wp_parse_args($_POST['post_data'])['billing_email'] ?? '') :
            get_userdata($user_id)->user_email;

        // Prepare order data
        $order_data = $this->prepare_order_data($customer_email);

        // Analyze order
        $result = $this->analyze_order($order_data);

        if ($result && isset($result['recommendation'])) {
            if ($result['recommendation'] === 'block' && get_option('fraudshield_block_high_risk')) {
                wc_add_notice(
                    'Your order could not be processed due to fraud detection. Please contact support.',
                    'error'
                );
            }
        }
    }

    /**
     * Analyze order after creation
     */
    public function analyze_order_for_fraud($order_id) {
        if (!$this->enabled || empty($this->api_key)) {
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        // Prepare order data
        $order_data = [
            'apiKey' => $this->api_key,
            'customer' => [
                'email' => $order->get_billing_email(),
                'name' => $order->get_formatted_billing_full_name(),
                'phone' => $order->get_billing_phone()
            ],
            'amount' => floatval($order->get_total()),
            'currency' => $order->get_currency(),
            'shippingAddress' => [
                'country' => $order->get_shipping_country(),
                'state' => $order->get_shipping_state(),
                'city' => $order->get_shipping_city(),
                'zipCode' => $order->get_shipping_postcode(),
                'street' => $order->get_shipping_address_1(),
                'streetLine2' => $order->get_shipping_address_2()
            ],
            'billingAddress' => [
                'country' => $order->get_billing_country(),
                'state' => $order->get_billing_state(),
                'city' => $order->get_billing_city(),
                'zipCode' => $order->get_billing_postcode(),
                'street' => $order->get_billing_address_1(),
                'streetLine2' => $order->get_billing_address_2()
            ],
            'paymentMethod' => $order->get_payment_method()
        ];

        // Analyze
        $result = $this->analyze_order($order_data);

        if ($result && isset($result['riskLevel'])) {
            // Store result in order meta
            update_post_meta($order_id, '_fraudshield_risk_score', $result['riskScore']);
            update_post_meta($order_id, '_fraudshield_risk_level', $result['riskLevel']);

            // Add order note
            $order->add_order_note(
                sprintf(
                    'FraudShield Analysis: Risk Score %d (%s)',
                    $result['riskScore'],
                    $result['riskLevel']
                )
            );

            // Flag for review if needed
            if ($result['riskLevel'] === 'risky' && get_option('fraudshield_review_risky')) {
                $order->update_status('on-hold', 'Flagged by FraudShield for manual review');
            } elseif ($result['riskLevel'] === 'fraud' && get_option('fraudshield_block_high_risk')) {
                $order->update_status('cancelled', 'Cancelled by FraudShield fraud detection');
            }
        }
    }

    /**
     * Analyze order with FraudShield API
     */
    private function analyze_order($order_data) {
        $response = wp_remote_post(
            $this->api_url . '/orders/analyze',
            [
                'method' => 'POST',
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'body' => wp_json_encode($order_data),
                'timeout' => 10
            ]
        );

        // Server বন্ধ বা URL ভুল বা timeout
        if (is_wp_error($response)) {
            $error_msg = $response->get_error_message();
            error_log('[FraudShield] Connection Error: ' . $error_msg);
            set_transient('fraudshield_admin_error', 'FraudShield সার্ভারে connect করা যাচ্ছে না: ' . $error_msg, 60);
            return null;
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body        = wp_remote_retrieve_body($response);
        $data        = json_decode($body, true);

        // API Key ভুল
        if ($status_code === 401) {
            error_log('[FraudShield] Invalid API Key');
            set_transient('fraudshield_admin_error', 'FraudShield API Key ভুল। Settings থেকে ঠিক করুন।', 60);
            return null;
        }

        // Daily limit শেষ
        if ($status_code === 429) {
            error_log('[FraudShield] Rate limit exceeded');
            set_transient('fraudshield_admin_notice', 'FraudShield দৈনিক limit শেষ। Orders fraud check ছাড়া চলছে।', 60);
            return null;
        }

        // অন্য যেকোনো error
        if ($status_code !== 200) {
            error_log('[FraudShield] API Error ' . $status_code . ' — Response: ' . $body);
            set_transient('fraudshield_admin_error', 'FraudShield API Error: HTTP ' . $status_code, 60);
            return null;
        }

        return $data;
    }

    /**
     * Prepare order data
     */
    private function prepare_order_data($customer_email) {
        return [
            'apiKey' => $this->api_key,
            'customer' => [
                'email' => $customer_email,
                'name' => isset($_POST['post_data']) ? 
                    sanitize_text_field(wp_parse_args($_POST['post_data'])['billing_first_name'] ?? '') : '',
            ],
            'amount' => WC()->cart->get_total(''),
            'currency' => get_woocommerce_currency(),
            'paymentMethod' => 'woocommerce'
        ];
    }

    /**
     * Get stats from orders
     */
    private function get_stats() {
        global $wpdb;

        $total = $wpdb->get_var(
            "SELECT COUNT(ID) FROM $wpdb->posts 
            WHERE post_type = 'shop_order' AND post_status NOT IN ('wc-trash', 'wc-cancelled')"
        );

        $fraud = $wpdb->get_var(
            "SELECT COUNT(pm.post_id) FROM $wpdb->postmeta pm
            WHERE pm.meta_key = '_fraudshield_risk_level' AND pm.meta_value = 'fraud'"
        );

        $risky = $wpdb->get_var(
            "SELECT COUNT(pm.post_id) FROM $wpdb->postmeta pm
            WHERE pm.meta_key = '_fraudshield_risk_level' AND pm.meta_value = 'risky'"
        );

        $safe = $total - intval($fraud) - intval($risky);

        return [
            'total_orders' => $total,
            'fraud_detected' => $fraud,
            'risky_orders' => $risky,
            'safe_orders' => $safe
        ];
    }

    /**
     * AJAX check email
     */
    public function ajax_check_email() {
        check_ajax_referer('fraudshield_nonce');

        if (!isset($_POST['email'])) {
            wp_send_json_error('Email required');
        }

        $email = sanitize_email($_POST['email']);
        
        // Call FraudShield API
        $response = wp_remote_post(
            $this->api_url . '/orders/analyze',
            [
                'method' => 'POST',
                'headers' => [
                    'Content-Type' => 'application/json',
                    'x-api-key' => $this->api_key
                ],
                'body' => wp_json_encode(['customer' => ['email' => $email]]),
                'timeout' => 5
            ]
        );

        if (is_wp_error($response)) {
            wp_send_json_error('API Error');
        }

        wp_send_json_success(json_decode(wp_remote_retrieve_body($response), true));
    }
}

// Initialize plugin
FraudShieldWooCommerce::get_instance();
